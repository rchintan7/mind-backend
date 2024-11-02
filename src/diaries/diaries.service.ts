import { Injectable } from '@nestjs/common';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { PrismaService } from 'nestjs-prisma';
import { Diary } from './entities/diary.entity';
import { diaries, diaryQuestions } from '@prisma/client';
import {
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  isFuture,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { DiaryResponse } from './dto/diary-response.dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class DiariesService {
  constructor(
    private prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  create(createDiaryDto: CreateDiaryDto) {
    return this.prisma.diaries.create({
      data: createDiaryDto,
    });
  }

  findAll() {
    return this.prisma.diaries.findMany();
  }

  findOne(id: string) {
    return this.prisma.diaries.findUnique({
      where: { id },
    });
  }

  // Method to fetch all diaries by userId
  async findDiariesByUserId(userId: string): Promise<Diary[]> {
    return this.prisma.diaries.findMany({
      where: { userId },
    });
  }

  update(id: string, updateDiaryDto: UpdateDiaryDto) {
    return this.prisma.diaries.update({
      where: { id },
      data: updateDiaryDto,
    });
  }

  remove(id: string) {
    return this.prisma.diaries.delete({
      where: { id },
    });
  }

  // Find diary by userId and specific date
  async findDiaryForUserByDate(userId: string, date: Date) {
    return this.prisma.diaries.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });
  }

  // Create a new diary for the user
  async createDiaryForUser(userId: string, date: Date): Promise<diaries> {
    return this.prisma.diaries.create({
      data: {
        userId,
        createdAt: date,
      },
    });
  }

  // async getOrCreateDiaryForUser(
  //   userId: string,
  //   date?: string,
  // ): Promise<DiaryResponse> {
  //   // Initialize the response structure
  //   const response: DiaryResponse = {
  //     success: true,
  //     chatEntry: undefined,
  //     question: undefined,
  //     options: undefined,
  //     message: '',
  //   };

  //   // Parse the date or use today's date if not provided
  //   const diaryDate = date ? parseISO(`${date}T00:00:00.000Z`) : new Date();

  //   // Check if the diary exists for the specific date
  //   let diary = await this.findDiaryForUserByDate(userId, diaryDate);

  //   if (!diary) {
  //     // If no diary, create initial chat entry
  //     diary = await this.createDiaryForUser(userId, diaryDate);
  //     const chatEntry = await this.chatService.createInitialChat(diary.id);
  //     response.chatEntry = [chatEntry];
  //     response.message = 'Diary and initial chat entry created successfully.';
  //     return response;
  //   }

  //   // If diary exists, get the last chat entry
  //   const chatHistory = await this.chatService.getChatsForDiary(diary.id);

  //   if (chatHistory.length === 0) {
  //     const chatEntry = await this.chatService.createInitialChat(diary.id);
  //     response.chatEntry = [chatEntry];
  //     response.message = 'Initial chat entry created successfully.';
  //     return response;
  //   }

  //   const lastChat = chatHistory[0];
  //   response.chatEntry = chatHistory;
  //   response.message = 'Default question generated successfully.';
  //   // Check if the last chat entry has been answered
  //   if (!lastChat.isAnswered) {
  //     response.chatEntry = chatHistory;
  //     response.message = 'Current question retrieved successfully.';
  //     return response;
  //   }
  //   const tags = await this.prisma.tags.findMany();
  //   const titlesArray = tags.map((tag) => tag.title);

  //   // Proceed based on the last chat answer type
  //   if (lastChat.answerType === 'MOOD') {
  //     const newEntry = await this.chatService.createChatEntry(
  //       diary.id,
  //       'What activities have you been doing today?',
  //       'TEXT',
  //       'ACTIVITY',
  //       'MULTIPLE',
  //       titlesArray,
  //     );
  //     response.chatEntry.unshift(newEntry);
  //     response.message = 'Next question for activities generated successfully.';
  //   } else if (lastChat.answerType === 'ACTIVITY') {
  //     // Return confirmation question
  //     const newEntry = await this.chatService.createChatEntry(
  //       diary.id,
  //       'Would you like to solve a task that will help you with your challenge?',
  //       'TEXT',
  //       'CONFIRM',
  //       'SINGLE',
  //       ['Yes', 'No'],
  //     );

  //     response.chatEntry.unshift(newEntry);
  //     response.message = 'Confirmation question generated successfully.';
  //   } else if (lastChat.answerType === 'CONFIRM') {
  //     const newEntry = await this.chatService.createChatEntry(
  //       diary.id,
  //       lastChat.answerOptions[0] === 'Yes'
  //         ? 'Awesome, there are tasks waiting for you.'
  //         : 'Oops, seems like you need some time. Please take rest and get back fresh.',
  //       lastChat.answerOptions[0] === 'Yes' ? 'TASK' : 'TEXT',
  //       'TEXT',
  //       'SINGLE',
  //       [],
  //     );
  //     response.chatEntry.unshift(newEntry);
  //     response.message = 'Free question generated successfully.';
  //   }

  //   return response; // Always return a consistent response structure
  // }

  async getOrCreateDiaryForUser(
    userId: string,
    date?: string,
  ): Promise<DiaryResponse> {
    const response: DiaryResponse = {
      success: true,
      chatEntry: undefined,
      question: undefined,
      options: undefined,
      message: '',
    };

    const diaryDate = date ? parseISO(`${date}T00:00:00.000Z`) : new Date();
    let diary = await this.findDiaryForUserByDate(userId, diaryDate);

    if (!diary) {
      diary = await this.createDiaryForUser(userId, diaryDate);
      const chatEntry = await this.chatService.createInitialChat(diary.id);
      response.chatEntry = [chatEntry];
      response.message = 'Diary and initial chat entry created successfully.';
      return response;
    }

    const chatHistory = await this.chatService.getChatsForDiary(diary.id);
    const lastChat = chatHistory[0];
    response.chatEntry = chatHistory;

    // Handle unanswered questions or confirmation steps
    if (!lastChat.isAnswered) {
      response.message = 'Current question retrieved successfully.';
      return response;
    }

    // Handle confirmation flow to proceed to the next diary question
    if (
      lastChat.answerType === 'CONFIRM' &&
      lastChat.answerOptions[0] === 'Yes'
    ) {
      const nextQuestion = await this.fetchNextDiaryQuestion(diary.id);
      if (nextQuestion) {
        const questionEntry = await this.chatService.createChatEntry(
          diary.id,
          nextQuestion.question,
          'TEXT',
          'TEXT',
          'SINGLE',
          [],
          nextQuestion.type,
        );
        response.chatEntry.unshift(questionEntry);
        response.message = 'Next diary question generated successfully.';
        return response;
      } else {
        const newEntry = await this.chatService.createChatEntry(
          diary.id,
          'Hast du Lust mit deinen Aufgaben weiter zu machen?',
          'TEXT',
          'TASK_CONFIRM',
          'SINGLE',
          ['Yes', 'No'],
        );

        response.chatEntry.unshift(newEntry);
        return response;
      }
    }

    if (lastChat.answerType == 'TASK_CONFIRM') {
      const newEntry = await this.chatService.createChatEntry(
        diary.id,
        lastChat.answerOptions[0] === 'Yes'
          ? 'Super, hier geht es zu deinen Aufgaben'
          : 'Hoppla, es scheint, als ob du etwas Zeit brauchst. Bitte ruhen Sie sich aus und kommen Sie frisch zurück.',
        lastChat.answerOptions[0] === 'Yes' ? 'TASK' : 'ARRAY',
        'TEXT',
        'SINGLE',
        [],
      );
      response.chatEntry.unshift(newEntry);
      response.message = 'Free question generated successfully.';
      return response;
    }

    // If the last entry was a diary question, ask for confirmation to proceed
    if (lastChat.answerType === 'TEXT' || lastChat.answerType === 'ACTIVITY') {
      const confirmEntry = await this.chatService.createChatEntry(
        diary.id,
        'Sind Sie sicher, dass Sie mit der nächsten Frage fortfahren möchten?',
        'TEXT',
        'CONFIRM',
        'SINGLE',
        ['Yes', 'No'],
      );
      response.chatEntry.unshift(confirmEntry);
      response.message =
        'Confirmation question for next step generated successfully.';
      return response;
    }

    // Default mood question when no specific flow is ongoing
    if (lastChat.answerType === 'MOOD') {
      const tags = await this.prisma.tags.findMany();
      const titlesArray = tags.map((tag) => tag.title);
      const newEntry = await this.chatService.createChatEntry(
        diary.id,
        'Was hast du heute so gemacht?',
        'TEXT',
        'ACTIVITY',
        'MULTIPLE',
        titlesArray,
      );
      response.chatEntry.unshift(newEntry);
      response.message = 'Next question for activities generated successfully.';
    }

    return response;
  }

  // Helper function to fetch the next diary question
  async fetchNextDiaryQuestion(
    diaryId: string,
  ): Promise<diaryQuestions | null> {
    const answeredQuestions = await this.prisma.chat.findMany({
      where: { diaryId, answerType: 'TEXT' },
      select: { message: true },
    });

    const answeredTitles = answeredQuestions.map((q) => q.message);

    return this.prisma.diaryQuestions.findFirst({
      where: { question: { notIn: answeredTitles } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getDiaryForUser(userId: string, date?: string) {
    const diaryQuery = {
      where: {
        userId,
        ...(date && {
          createdAt: {
            gte: startOfDay(parseISO(date)),
            lte: endOfDay(parseISO(date)),
          },
        }),
      },
      include: {
        chat: true, // No need to include answerOptions separately, it's part of chat
      },
    };

    const diaries = await this.prisma.diaries.findMany(diaryQuery);

    // If no date is passed, fetch diaries for all available dates
    const fetchAllDates = !date;
    let diaryCountWeekly = 0;
    let diaryStatusWeekly = [];

    if (date) {
      // Get the start and end of the current week (Monday to Sunday)
      const weekStart = startOfWeek(parseISO(date), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(parseISO(date), { weekStartsOn: 1 });

      // Count diary entries for the week
      const weeklyDiaries = await this.prisma.diaries.findMany({
        where: {
          userId,
          createdAt: {
            gte: startOfDay(weekStart),
            lte: endOfDay(weekEnd),
          },
        },
      });

      diaryCountWeekly = weeklyDiaries.length;

      // Get each day from weekStart to weekEnd
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

      // Populate diaryStatusWeekly
      diaryStatusWeekly = await Promise.all(
        weekDays.map(async (day) => {
          if (isFuture(day)) {
            return {
              date: format(day, 'dd.MM.yyyy'),
              status: null, // Future dates have null status
            };
          }
          const dayDiary = await this.prisma.diaries.findFirst({
            where: {
              userId,
              createdAt: {
                gte: startOfDay(day),
                lte: endOfDay(day),
              },
            },
          });

          return {
            date: format(day, 'dd.MM.yyyy'),
            status: !!dayDiary,
          };
        }),
      );
    }

    // Transform diaries data
    const formattedDiaries = await Promise.all(
      diaries.map(async (diary) => {
        const moodChat = diary.chat.find(
          (chat) => chat.answerType === 'MOOD' && chat.isAnswered === true,
        );
        const activityChat = diary.chat.find(
          (chat) => chat.answerType === 'ACTIVITY' && chat.isAnswered === true,
        );

        const freeText = diary.chat[diary.chat.length - 1];

        // Get the start and end of the current week (if date is provided), or fetch for all dates
        const weekDays = fetchAllDates
          ? [] // No specific week, will fetch all available diary entries
          : eachDayOfInterval({
              start: startOfWeek(parseISO(date), { weekStartsOn: 1 }),
              end: endOfWeek(parseISO(date), { weekStartsOn: 1 }),
            });

        // Fetch mood entries for each day of the week if a specific date is passed
        const moodWeek = fetchAllDates
          ? [] // Don't fetch week data if no date is passed
          : (
              await Promise.all(
                weekDays.map(async (day) => {
                  const dayDiary = await this.prisma.diaries.findFirst({
                    where: {
                      userId,
                      createdAt: {
                        gte: startOfDay(day),
                        lte: endOfDay(day),
                      },
                    },
                    include: {
                      chat: true,
                    },
                  });

                  // Find the mood for the day and return only if a mood is found
                  if (dayDiary) {
                    const moodChat = dayDiary.chat.find(
                      (chat) =>
                        chat.answerType === 'MOOD' && chat.isAnswered === true,
                    );
                    if (moodChat) {
                      return {
                        [format(day, 'dd.MM.yyyy')]: moodChat.answerOptions[0],
                      };
                    }
                  }
                  return null; // Return null for days without a mood
                }),
              )
            ).filter((entry) => entry !== null); // Filter out null entries

        return {
          id: diary.id,
          mood: moodChat ? moodChat.answerOptions : [],
          activity: activityChat ? activityChat.answerOptions : [],
          freeText: freeText ? freeText.message : '',
          moodWeek: moodWeek, // Only days with mood entries will be included (if date is provided)
          createdAt: diary.createdAt,
        };
      }),
    );

    return {
      success: true,
      diaries: formattedDiaries,
      diaryCountWeekly,
      diaryStatusWeekly,
      message: 'Diary data retrieved successfully.',
    };
  }
}
