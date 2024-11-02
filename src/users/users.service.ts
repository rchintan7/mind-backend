import { PrismaService } from 'nestjs-prisma';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './models/user.model';
import { baseCategory, taskFlow, taskHistory, userMood } from '@prisma/client';
import { Category } from '../categories/models/category.model';
import { MoodsService } from '../moods/moods.service';
import {
  endOfDay,
  endOfMonth,
  format,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private moodsService: MoodsService,
  ) {}

  updateUser(
    userId: string,
    newUserData: Partial<UpdateUserInput>,
  ): Promise<Partial<User>> {
    return this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
      },
    });
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordInput,
  ) {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword,
    );

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }

  async getMeWithCategories(userId: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async getMeTaskFlows(
    user: Partial<User>,
    baseCategory: baseCategory,
  ): Promise<Partial<taskFlow>[]> {
    const xp = user.experiencePoints;
    const level = user.userLevel;

    const taskflows = await this.prisma.taskFlow.findMany({
      where: {
        OR: [
          { userExperiencePointsMin: { lte: xp } },
          { userExperiencePointsMax: { gte: xp } },
        ],
        categoryRequirements: {
          some: {
            OR: [{ minLevel: { lte: level } }, { maxLevel: { gte: level } }],
            category: {
              baseCategory: {
                equals: baseCategory,
              },
            },
          },
        },
      },
      include: {
        tasks: {
          include: {
            answers: true,
          },
        },
        categoryRequirements: {
          include: {
            category: true,
          },
        },
      },
    });

    const updatedTaskflows = await Promise.all(
      taskflows.map(async (taskflow) => {
        const updatedTasks = await Promise.all(
          taskflow.tasks.map(async (task) => {
            const taskHistory = await this.prisma.taskHistory.findUnique({
              where: {
                userId_taskId: {
                  userId: user.id,
                  taskId: task.id,
                },
              },
            });

            return {
              ...task,
              isCompleted: taskHistory ? taskHistory.isCompleted : false,
            };
          }),
        );

        return {
          taskflowId: taskflow.id,
          taskflowTitle: taskflow.title,
          taskflowDescription: taskflow.description,
          taskflowTime: taskflow.requiredTimeForTaskFlow,
          totalTasks: taskflow.tasks.length ?? 0,
          taskFlowType: taskflow.taskFlowType,
          tasks: updatedTasks,
          categories: taskflow.categoryRequirements,
        };
      }),
    );

    return updatedTaskflows;
  }

  async getAllUserTaskflows(user: Partial<User>): Promise<Partial<taskFlow>[]> {
    const xp = user.experiencePoints;
    const level = user.userLevel;

    const taskHistory = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
      },
    });

    const taskCompletionMap = taskHistory.reduce((acc, task) => {
      acc[task.taskId] = task.isCompleted;
      return acc;
    }, {});

    const taskFlows = await this.prisma.taskFlow.findMany({
      where: {
        OR: [
          { userExperiencePointsMin: { lte: xp } },
          { userExperiencePointsMax: { gte: xp } },
        ],
        categoryRequirements: {
          some: {
            OR: [{ minLevel: { lte: level } }, { maxLevel: { gte: level } }],
          },
        },
      },
      include: {
        tasks: {
          include: {
            answers: true,
          },
        },
        categoryRequirements: {
          include: {
            category: true,
          },
        },
        categoryParametersToEarn: true,
      },
    });

    const taskFlowsWithCompletionStatus = taskFlows.map((taskFlow) => {
      const tasksWithCompletionStatus = taskFlow.tasks.map((task) => ({
        ...task,
        isCompleted: taskCompletionMap[task.id] || false,
      }));

      return {
        ...taskFlow,
        tasks: tasksWithCompletionStatus,
      };
    });

    return taskFlowsWithCompletionStatus;
  }

  async changeMood(userId: string, mood: userMood) {
    await this.prisma.user.update({
      data: {
        currentMood: mood,
      },
      where: {
        id: userId,
      },
    });
  }

  async userFeed(user: User) {
    const xp = user.experiencePoints;
    const lastSeenContent = user.lastSeenContent;

    const batchSize = 10;

    const fetched_user = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    const userCategoryIds = fetched_user.categories.map(
      (category) => category.categoryId,
    );
    const likedContents = user.likedContents;

    // const baseQuery: any = {
    //   where: {
    //     userExperiencePointsMin: { lte: xp },
    //     userExperiencePointsMax: { gte: xp },
    //     OR: [{ type: 'IMAGE' }, { type: 'VIDEO' }],
    //     categoryRequirements: {
    //       some: {
    //         categoryId: {
    //           in: userCategoryIds,
    //         },
    //         minLevel: { lte: xp },
    //         maxLevel: { gte: xp },
    //       },
    //     },
    //   },
    //   take: batchSize,
    //   orderBy: { id: 'asc' },
    // };

    // const feedContent = await this.prisma.content.findMany(baseQuery);

    const baseQuery: any = {
      where: {
        OR: [{ type: 'IMAGE' }, { type: 'VIDEO' }],
      },
      include: {
        categoryRequirements: true,
      },
      take: batchSize,
      orderBy: { id: 'asc' },
    };

    if (lastSeenContent) {
      baseQuery.where = {
        ...baseQuery.where,
        id: { gt: lastSeenContent },
      };
    }

    const feedAllContent = await this.prisma.content.findMany(baseQuery);

    let contentData = [];

    for (let content of feedAllContent) {
      if (
        !content.userExperiencePointsMin ||
        !content.userExperiencePointsMax
      ) {
        contentData.push(content);
      } else if (
        content.userExperiencePointsMax ||
        content.userExperiencePointsMin
      ) {
        const cnt = await this.prisma.content.findFirst({
          where: {
            userExperiencePointsMin: { lte: xp },
            userExperiencePointsMax: { gte: xp },
          },
        });

        contentData.push(cnt);
      }
    }

    return contentData;
  }

  async modifySocialBattery(user: User, socialBattery: number) {
    let userSocialBattery = user.socialBattery;

    userSocialBattery += socialBattery;

    if (userSocialBattery < 0) userSocialBattery = 0;
    else if (userSocialBattery > 100) userSocialBattery = 100;

    return this.prisma.user.update({
      data: {
        socialBattery: userSocialBattery,
      },
      where: {
        id: user.id,
      },
    });
  }

  async userLikedContent(user: User, contentId: string, liked: boolean) {
    await this.prisma.content.update({
      data: {
        likes: liked ? { increment: 1 } : { decrement: 1 },
      },
      where: {
        id: contentId,
      },
    });

    if (liked) {
      await this.prisma.user.update({
        data: {
          likedContents: {
            push: contentId,
          },
        },
        where: {
          id: user.id,
        },
      });
    } else {
      const userData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          likedContents: true,
        },
      });

      const updatedContents = userData?.likedContents.filter(
        (id: string) => id !== contentId,
      );

      await this.prisma.user.update({
        data: {
          likedContents: updatedContents,
        },
        where: {
          id: user.id,
        },
      });
    }
  }

  async userFavoriteContents(user: User) {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { likedContents: true },
    });

    if (!userData || userData.likedContents.length === 0) {
      return [];
    }

    const favoriteContents = await this.prisma.content.findMany({
      where: {
        id: { in: userData.likedContents },
      },
    });

    return favoriteContents;
  }

  async userTaskHistory(user: User, taskData: taskHistory) {
    const { taskId, taskflowId, categoryId, isCompleted, baseCategory } =
      taskData;

    await this.prisma.taskHistory.upsert({
      where: {
        userId_taskId: {
          userId: user.id,
          taskId: taskId,
        },
      },
      update: {
        isCompleted: isCompleted,
      },
      create: {
        userId: user.id,
        taskId: taskId,
        taskflowId: taskflowId,
        categoryId: categoryId,
        isCompleted: isCompleted,
        baseCategory: baseCategory,
        userLevel: user.userLevel,
      },
    });

    const taskflow = await this.prisma.taskFlow.findUnique({
      where: {
        id: taskflowId,
      },
      include: {
        tasks: true,
      },
    });

    if (taskflow) {
      const taskIds = taskflow.tasks.map((task) => task.id);

      const completedTasks = await this.prisma.taskHistory.findMany({
        where: {
          userId: user.id,
          taskId: { in: taskIds },
          isCompleted: true,
        },
      });

      if (completedTasks.length === taskIds.length) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            experiencePoints: {
              increment: taskflow.userExperiencePointsToEarn,
            },
          },
        });
      }
    }
  }

  async categoryChart(user: User) {
    const categoryChartData = {
      JOY_OF_LIFE: 0,
      PERSONAL_GROWTH: 0,
      EMOTIONAL_STRENGTH: 0,
      RELATIONSHIPS: 0,
    };

    const data = await this.prisma.taskHistory.groupBy({
      by: ['categoryId'],
      where: {
        userId: user.id,
        isCompleted: true,
      },
      _count: {
        _all: true,
      },
    });

    if (data.length > 0) {
      const categoryIds = data.map((d) => d.categoryId).filter(Boolean);
      const categories = await this.prisma.categories.findMany({
        where: {
          id: { in: categoryIds },
        },
      });

      const categoryMap = categories.reduce((acc, category) => {
        acc[category.id] = category.baseCategory;
        return acc;
      }, {});

      for (const obj of data) {
        const baseCategory = categoryMap[obj.categoryId];

        if (baseCategory) {
          categoryChartData[baseCategory] += obj._count._all;
        }
      }
    }

    return categoryChartData;
  }

  async maintainStreak(userId: string) {
    // Fetch the user data
    const user: User = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    const currentTime = new Date();
    const lastStreakUpdate = user.streakUpdatedTime
      ? new Date(user.streakUpdatedTime)
      : null;

    // Helper function to check if two dates are the same day
    const isSameDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    // Case 1: First time or it's been more than 1 day since the last streak update
    if (
      !lastStreakUpdate ||
      currentTime.getTime() - lastStreakUpdate.getTime() > 24 * 60 * 60 * 1000
    ) {
      // Reset streak if it's been more than 1 day
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          streakCount: 1,
          streakUpdatedTime: currentTime,
        },
      });

      return {
        success: true,
        streakCount: 1,
        message: 'Your streak has been reset or started fresh.',
      };
    }

    // Case 2: Streak continues (last streak update was yesterday)
    const oneDayAgo = new Date(currentTime);
    oneDayAgo.setDate(currentTime.getDate() - 1);

    if (isSameDay(lastStreakUpdate, oneDayAgo)) {
      // Increment the streak count
      const newStreakCount = user.streakCount + 1;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          streakCount: newStreakCount,
          streakUpdatedTime: currentTime,
        },
      });

      return {
        success: true,
        streakCount: newStreakCount,
        message: `Streak continued! Your current streak is ${newStreakCount} days.`,
      };
    }

    // Case 3: User opened the app today (no streak change)
    if (isSameDay(lastStreakUpdate, currentTime)) {
      return {
        success: true,
        streakCount: user.streakCount,
        message:
          'You have already opened the app today. Streak remains unchanged.',
      };
    }

    // In case any other condition is met (this shouldn't happen but is a safeguard)
    return {
      success: false,
      message: 'Unexpected condition occurred.',
    };
  }

  // This method increments the user's appCount by 1 each time it is called.
  async maintainAppcount(userId: string) {
    // Fetch the user data
    const user: User = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Increment the appCount by 1
    const newAppCount = user.appOpenCount + 1;

    // Update the user's appCount in the database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        appOpenCount: newAppCount,
      },
    });

    return {
      success: true,
      appCount: newAppCount,
      message: `App count increased! Your current app count is ${newAppCount}.`,
    };
  }

  // async getDiaryTrendsForUser(userId: string, date?: string) {
  //   const diaryQuery = {
  //     where: {
  //       userId,
  //       ...(date && {
  //         createdAt: {
  //           gte: startOfDay(parseISO(date)),
  //           lte: endOfDay(parseISO(date)),
  //         },
  //       }),
  //     },
  //     include: {
  //       chat: true,
  //     },
  //   };

  //   const diaries = await this.prisma.diaries.findMany(diaryQuery);

  //   // Initialize trends structure for activities
  //   const activities = [
  //     'Family',
  //     'Gamble',
  //     'Sport',
  //     'Work',
  //     'Date',
  //     'See friends',
  //   ];
  //   const moods = ['BAD', 'OK', 'NORMAL', 'GOOD', 'SUPER'];

  //   // Initialize the trends object with 0 counts for each activity and mood
  //   const trends: { [activity: string]: { [mood: string]: number } } = {};
  //   activities.forEach((activity) => {
  //     trends[activity] = {};
  //     moods.forEach((mood) => {
  //       trends[activity][mood] = 0;
  //     });
  //   });

  //   // Process each diary entry and update the trends
  //   diaries.forEach((diary) => {
  //     const moodChat = diary.chat.find(
  //       (chat) => chat.answerType === 'MOOD' && chat.isAnswered === true,
  //     );
  //     const activityChat = diary.chat.find(
  //       (chat) => chat.answerType === 'ACTIVITY' && chat.isAnswered === true,
  //     );

  //     if (moodChat && activityChat) {
  //       const diaryMoods = moodChat.answerOptions; // Array of moods for the day
  //       const diaryActivities = activityChat.answerOptions; // Array of activities for the day

  //       diaryActivities.forEach((activity) => {
  //         if (trends[activity]) {
  //           diaryMoods.forEach((mood) => {
  //             if (trends[activity][mood] !== undefined) {
  //               trends[activity][mood] += 1; // Increment mood count for this activity
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });

  //   return trends;
  // }

  // async getAnalyseDataForUser(userId: string, date?: string) {
  //   const user: User = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });
  //   const response = {
  //     MOOD_MAP_DATA: [],
  //     MOOD_LINE_DATA: {
  //       BAD: 0,
  //       OK: 0,
  //       NORMAL: 0,
  //       GOOD: 0,
  //       SUPER: 0,
  //       MAIN: '',
  //     },
  //     TRENDS: {},
  //     STREAK: 0,
  //     DAYS_OF_MONTH: 0,
  //     message: '',
  //   };

  //   try {
  //     if (date) {
  //       // Get hourly mood data
  //       const hourlyMood = await this.moodsService.getMonthlyMoodAverage(
  //         userId,
  //       );
  //       response.MOOD_MAP_DATA = hourlyMood;

  //       // Get monthly mood averages
  //       const monthlyMood = await this.moodsService.getMonthlyMoodAverageCount(
  //         userId,
  //         date,
  //       );

  //       response.MOOD_LINE_DATA = {
  //         ...monthlyMood,
  //       };

  //       // Get the total number of days in the current month
  //       const currentMonth = new Date(date).getMonth();
  //       const totalDaysInMonth = new Date(
  //         new Date(date).getFullYear(),
  //         currentMonth + 1,
  //         0,
  //       ).getDate();
  //       response.DAYS_OF_MONTH = totalDaysInMonth;
  //       response.STREAK = user.streakCount;
  //       response.TRENDS = await this.getDiaryTrendsForUser(userId, date);

  //       response.message = `Analyse data for the date ${date} retrieved successfully.`;
  //     } else {
  //       response.message =
  //         'No date provided. Please pass a valid date for Analyse data.';
  //     }
  //   } catch (error) {
  //     response.message = `An error occurred: ${error.message}`;
  //   }

  //   return response;
  // }

  async getDiaryTrendsForUser(userId: string, month: string, year: string) {
    // Convert month and year to start and end dates of the month
    const parsedDate = parse(`${year}-${month}-01`, 'yyyy-MMMM-dd', new Date());
    const startDate = startOfMonth(parsedDate);
    const endDate = endOfMonth(parsedDate);

    const diaryQuery = {
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        chat: true,
      },
    };

    const diaries = await this.prisma.diaries.findMany(diaryQuery);

    // Process trends as before
    const activities = [
      'Family',
      'Gamble',
      'Sport',
      'Work',
      'Date',
      'See friends',
    ];
    const moods = ['BAD', 'OK', 'NORMAL', 'GOOD', 'SUPER'];

    const trends: { [activity: string]: { [mood: string]: number } } = {};
    activities.forEach((activity) => {
      trends[activity] = {};
      moods.forEach((mood) => {
        trends[activity][mood] = 0;
      });
    });

    diaries.forEach((diary) => {
      const moodChat = diary.chat.find(
        (chat) => chat.answerType === 'MOOD' && chat.isAnswered === true,
      );
      const activityChat = diary.chat.find(
        (chat) => chat.answerType === 'ACTIVITY' && chat.isAnswered === true,
      );

      if (moodChat && activityChat) {
        const diaryMoods = moodChat.answerOptions;
        const diaryActivities = activityChat.answerOptions;

        diaryActivities.forEach((activity) => {
          if (trends[activity]) {
            diaryMoods.forEach((mood) => {
              if (trends[activity][mood] !== undefined) {
                trends[activity][mood] += 1;
              }
            });
          }
        });
      }
    });

    return trends;
  }

  async getDiaryEntriesForMonth(userId: string, month: string, year: string) {
    // Convert month and year to a start and end date for the query
    const startDate = startOfMonth(new Date(`${year}-${month}-01`));
    const endDate = endOfMonth(new Date(`${year}-${month}-01`));

    const diaries = await this.prisma.diaries.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        chat: true,
      },
    });

    // Initialize the calendar data object
    const calendarData: { [key: string]: string[] } = {};

    // Process each diary entry and map activities to dates
    diaries.forEach((diary) => {
      const activityChat = diary.chat.find(
        (chat) => chat.answerType === 'ACTIVITY' && chat.isAnswered === true,
      );
      console.log('activityChat = ', activityChat);

      if (activityChat) {
        const diaryActivities = activityChat.answerOptions; // Array of activities for the day
        const formattedDate = format(diary.createdAt, 'yyyy-MM-dd'); // Format the date

        // If the date already exists in calendarData, append the activities
        if (calendarData[formattedDate]) {
          calendarData[formattedDate].push(...diaryActivities);
        } else {
          // Otherwise, initialize the date with the activities
          calendarData[formattedDate] = [...diaryActivities];
        }
        console.log('calendarData = ', calendarData);
      }
    });

    return calendarData;
  }

  async getAnalyseDataForUser(userId: string, month: string, year: string) {
    const user: User = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const response = {
      CALENDAR_DATA: {},
      MOOD_MAP_DATA: [],
      MOOD_LINE_DATA: {
        BAD: 0,
        OK: 0,
        NORMAL: 0,
        GOOD: 0,
        SUPER: 0,
        MAIN: '',
      },
      TRENDS: {},
      STREAK: 0,
      DAYS_OF_MONTH: 0,
      SOCIAL_BATTERY: user.socialBattery,
      USER_XP: user.experiencePoints,
      message: '',
    };

    try {
      if (month && year) {
        // Get start and end dates based on month and year
        const parsedDate = parse(
          `${year}-${month}-01`,
          'yyyy-MMMM-dd',
          new Date(),
        );

        // Get mood and trend data
        const hourlyMood = await this.moodsService.getMonthlyMoodAverage(
          userId,
          month,
          year,
        );
        response.MOOD_MAP_DATA = hourlyMood;

        const monthlyMood = await this.moodsService.getMonthlyMoodAverageCount(
          userId,
          month,
          year,
        );
        response.MOOD_LINE_DATA = { ...monthlyMood };

        // Get total days in the month
        const totalDaysInMonth = new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth() + 1,
          0,
        ).getDate();
        response.CALENDAR_DATA = await this.getDiaryEntriesForMonth(
          userId,
          month,
          year,
        );
        response.DAYS_OF_MONTH = totalDaysInMonth;
        response.STREAK = user.streakCount;
        response.TRENDS = await this.getDiaryTrendsForUser(userId, month, year);

        response.message = `Analyse data for ${month} ${year} retrieved successfully.`;
      } else {
        response.message =
          'Please pass a valid month and year for Analyse data.';
      }
    } catch (error) {
      response.message = `An error occurred: ${error.message}`;
    }

    return response;
  }

  async addUserQuiz(user: User, quizData: any) {
    if (typeof quizData !== 'string' && quizData.length > 0) {
      quizData = JSON.stringify(quizData);
    }

    if (quizData && quizData.length > 0) {
      await this.prisma.quizData.create({
        data: {
          email: user.email,
          quiz: quizData,
        },
      });
    }

    return {
      success: true,
    };
  }

  async deleteUserAccount(user: User) {
    await this.prisma.userArchivement.deleteMany({
      where: { userId: user.id },
    });
    await this.prisma.userCategory.deleteMany({ where: { userId: user.id } });
    await this.prisma.moods.deleteMany({ where: { userId: user.id } });
    await this.prisma.diaries.deleteMany({ where: { userId: user.id } });
    await this.prisma.goals.deleteMany({ where: { userId: user.id } });

    return this.prisma.user.delete({
      where: { id: user.id },
    });
  }

  async deleteUserAchievementt(user: User, achievementId: string) {
    return this.prisma.userArchivement.delete({
      where: {
        id: achievementId,
        userId: user.id,
      },
    });
  }

  async getAchievementByUser(user: User) {
    const totalAchievements = await this.prisma.archivement.findMany({
      include: {
        archivementCategoryRequirement: true,
      },
    });

    // Fetch user's category levels from `userCategory`
    const userCategories = await this.prisma.userCategory.findMany({
      where: { userId: user.id },
      select: {
        categoryId: true,
        level: true,
      },
    });

    // Map user categories for quick lookup
    const userCategoryLevels = new Map(
      userCategories.map((cat) => [cat.categoryId, cat.level]),
    );

    // Fetch user's mood tracking from the moods table
    const userMoods = await this.prisma.moods.findMany({
      where: { userId: user.id },
      select: {
        mood: true,
      },
    });

    // Count how many times each mood type is tracked by the user
    const moodCounts = userMoods.reduce((acc, moodRecord) => {
      const moodValue = moodRecord.mood;
      acc[moodValue] = (acc[moodValue] || 0) + 1;
      return acc;
    }, {});

    const achievementMessages: string[] = [];
    let additionalXp = 0;

    await Promise.all(
      totalAchievements.map(async (achievement) => {
        let conditionsMet = 0;
        let totalConditions = 0;

        // Check category points required condition
        if (achievement.pointsRequired !== null) {
          totalConditions++;
          if (
            achievement.archivementCategoryRequirement &&
            achievement.archivementCategoryRequirement.length > 0
          ) {
            const categoryRequirementsMet =
              achievement.archivementCategoryRequirement.every(
                (requirement) => {
                  const userLevel = userCategoryLevels.get(
                    requirement.categoryId,
                  );
                  return (
                    userLevel !== undefined && userLevel >= requirement.minLevel
                  );
                },
              );

            if (categoryRequirementsMet) conditionsMet++;
          }
        }

        //Check no of tasks completed
        if (achievement.tasksDone !== null) {
          totalConditions++;
          const allTasks = await this.prisma.taskHistory.findMany({
            where: {
              userId: user.id,
              isCompleted: true,
            },
          });

          if (allTasks.length >= achievement.tasksDone) conditionsMet++;
        }

        //Check no of affirmations completed
        if (achievement.affirmationsDone !== null) {
          totalConditions++;
          const allAffirmations = await this.prisma.userAffirmation.findMany({
            where: {
              userId: user.id,
              isChecked: true,
            },
          });

          if (allAffirmations.length >= achievement.affirmationsDone)
            conditionsMet++;
        }

        //Check no of quizzes completed
        if (achievement.quizzesDone !== null) {
          totalConditions++;
          if (user.quizzesCompleted >= achievement.quizzesDone) conditionsMet++;
        }

        //Check no of videos viewd
        if (achievement.videosSeen !== null) {
          totalConditions++;
          if (user.videoCount >= achievement.videosSeen) conditionsMet++;
        }

        // Check XP required condition
        if (achievement.xpRequired !== null) {
          totalConditions++;
          if (user.experiencePoints >= achievement.xpRequired) conditionsMet++;
        }

        // Check XP required condition
        if (achievement.loginStreak !== null) {
          totalConditions++;
          if (user.streakCount >= achievement.loginStreak) conditionsMet++;
        }

        // Check Frequency indication of mood condition
        if (achievement.moodTracked !== null) {
          totalConditions++;
          const totalMoodChanges = await this.prisma.moods.findMany({
            where: {
              userId: user.id,
            },
          });
          if (
            totalMoodChanges.length !== 0 &&
            totalMoodChanges.length >= achievement.moodTracked
          )
            conditionsMet++;
        }

        // Check moodTypeTracked condition
        if (achievement.moodTypeTracked !== null) {
          totalConditions++;
          const moodTypeTracked = achievement.moodTypeTracked; // e.g., {"OK": "12", "NORMAL": "43"}

          let moodConditionMet = false;

          // Check if the user meets the mood tracking conditions
          for (const [moodType, requiredCount] of Object.entries(
            moodTypeTracked,
          )) {
            const count = moodCounts[moodType] || 0;

            if (count !== 0 && count >= Number(requiredCount)) {
              moodConditionMet = true;
              break;
            }
          }

          if (moodConditionMet) conditionsMet++;
        }

        // Calculate progress for achievement
        if (totalConditions > 0 && conditionsMet > 0) {
          const progress = Math.round((conditionsMet / totalConditions) * 100);

          const existingAchievement =
            await this.prisma.userArchivement.findFirst({
              where: {
                userId: user.id,
                archivementId: achievement.id,
              },
            });

          if (!existingAchievement) {
            // Create new achievement if it does not exist
            await this.prisma.userArchivement.create({
              data: {
                userId: user.id,
                archivementId: achievement.id,
                progress,
                completedAt: progress === 100 ? new Date() : null,
              },
            });
            achievementMessages.push(
              `Achievement ${achievement.title} awarded with progress: ${progress}%`,
            );

            // Add XP if achievement is complete and has XP to earn
            if (progress === 100 && achievement.xpToEarn) {
              additionalXp += achievement.xpToEarn;
            }
          } else if (
            existingAchievement.progress < 100 &&
            existingAchievement.progress < progress
          ) {
            // Update existing achievement if progress has increased
            await this.prisma.userArchivement.update({
              where: { id: existingAchievement.id },
              data: {
                progress,
                completedAt: progress === 100 ? new Date() : null,
              },
            });
            achievementMessages.push(
              `Achievement ${achievement.title} progress updated to: ${progress}%`,
            );

            // Add XP if achievement is now complete and has XP to earn
            if (progress === 100 && achievement.xpToEarn) {
              additionalXp += achievement.xpToEarn;
            }
          }
        }
      }),
    );

    // Update user's experience points if additional XP is earned
    if (additionalXp > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { experiencePoints: user.experiencePoints + additionalXp },
      });
    }

    const userAchievements = await this.prisma.userArchivement.findMany({
      where: { userId: user.id },
      include: { archivement: true },
    });

    return {
      achievements: userAchievements.map((achievement) => ({
        ...achievement.archivement,
        progress: achievement.progress,
      })),
      messages:
        achievementMessages.length > 0
          ? achievementMessages
          : ['No new progress in achievements.'],
    };
  }

  async getAchievementsAll() {
    return this.prisma.userArchivement.findMany({});
  }

  async videoViewCount(user: User) {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        videoCount: {
          increment: 1,
        },
      },
    });
  }
}
