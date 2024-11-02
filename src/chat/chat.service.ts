import { Injectable } from '@nestjs/common';
import {
  Prisma,
  answerType,
  chat,
  diaryTypes,
  messageSentBy,
  messageType,
  selctionType,
} from '@prisma/client'; // Use lowercase `chat`
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch all chats
  async findAll(): Promise<chat[]> {
    return this.prisma.chat.findMany();
  }

  remove(id: string) {
    return this.prisma.chat.delete({
      where: { id },
    });
  }

  // Create a new chat
  async createChat(data: Prisma.chatCreateInput): Promise<chat> {
    return this.prisma.chat.create({
      data,
    });
  }

  // Fetch chats by diaryId
  async findChatsByDiaryId(diaryId: string): Promise<chat[]> {
    return this.prisma.chat.findMany({
      where: {
        diaryId,
      },
    });
  }

  // Create the first chat entry for the diary
  async createInitialChat(diaryId: string): Promise<chat> {
    return this.prisma.chat.create({
      data: {
        message: 'Guten Morgen, wie geht es dir heute?',
        from: messageSentBy.APP,
        messageType: messageType.TEXT,
        answerType: answerType.MOOD,
        selctionType: selctionType.SINGLE,
        answerOptions: ['BAD', 'OK', 'NORMAL', 'GOOD', 'SUPER'],
        diaryId,
      },
    });
  }

  // Get the latest chat entry for the diary
  async getChatsForDiary(diaryId: string): Promise<chat[] | null> {
    return this.prisma.chat.findMany({
      where: { diaryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create a new chat entry
  async createChatEntry(
    diaryId: string,
    message: string,
    messageType: messageType,
    answerType: answerType,
    selctionType: selctionType,
    answerOptions: string[],
    questionType?: diaryTypes,
    isAnswered?: boolean,
  ): Promise<chat> {
    return this.prisma.chat.create({
      data: {
        diaryId,
        message,
        from: 'APP',
        messageType,
        answerType,
        selctionType,
        answerOptions,
        isAnswered: isAnswered ? isAnswered : false,
        questionType: questionType ? questionType : diaryTypes.OTHERS,
      },
    });
  }

  async storeUserAnswer(diaryId: string, answer: string[], freeText?: string) {
    if (freeText && freeText.trim()) {
      // Insert a new entry in chat
      await this.prisma.chat.create({
        data: {
          diaryId,
          message: freeText,
          from: 'USER',
          messageType: 'TEXT',
          answerType: 'TEXT',
          selctionType: 'SINGLE',
          answerOptions: [],
          isAnswered: true, // Set to false on creation
        },
      });
      // return { message: 'New chat entry created as free text .' };
    }

    const chatEntry = await this.prisma.chat.findFirst({
      where: {
        diaryId,
        isAnswered: false, // Find the unanswered chat entry
      },
    });

    if (chatEntry) {
      return this.prisma.chat.update({
        where: { id: chatEntry.id },
        data: {
          answerOptions: freeText ? [freeText] : answer, // Store the answer
          isAnswered: true, // Mark as answered
        },
      });
    }

    return;
  }

  async getchatByDiaryIdAndType(diaryId: string, questionType: diaryTypes) {
    const chatEntry = await this.prisma.chat.findMany({
      where: {
        diaryId,
        questionType,
        isAnswered: true,
      },
    });

    return chatEntry;
  }
}
