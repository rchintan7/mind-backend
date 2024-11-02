import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User } from 'src/users/models/user.model';

@Injectable()
export class UserCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async setUserCategories(user: User, selectedCategories: any) {
    // await this.prisma.userCategory.deleteMany({
    //   where: {
    //     userId: user.id,
    //   },
    // });

    // for (const categoryGroup of selectedCategories) {
    //   for (const [baseCategory, categoryIds] of Object.entries(categoryGroup)) {
    //     const categoryIds = categoryGroup[baseCategory] as string[];
    //     for (const categoryId of categoryIds) {
    //       const existingUserCategory = await this.prisma.userCategory.findFirst(
    //         {
    //           where: {
    //             userId: user.id,
    //             categoryId: categoryId,
    //           },
    //         },
    //       );

    //       if (existingUserCategory) {
    //         await this.prisma.userCategory.update({
    //           where: {
    //             id: existingUserCategory.id,
    //           },
    //           data: {
    //             level: user.userLevel,
    //           },
    //         });
    //       }
    //     }
    //   }
    // }

    for (let categoryId of selectedCategories) {
      const currCategory = await this.prisma.categoryParameterToEarn.findFirst({
        where: {
          categoryId: categoryId,
        },
      });

      if (currCategory) {
        const userCategory = await this.prisma.userCategory.findFirst({
          where: { categoryId: categoryId },
        });

        if (userCategory) {
          await this.prisma.userCategory.update({
            where: { id: userCategory.id },
            data: {
              earnedXP: {
                increment: currCategory?.valueToEarn || 0,
              },
            },
          });
        }
      }
    }

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { categories: true },
    });

    const userCategories = updatedUser.categories;
    const userCategoryIds = userCategories.map(
      (category) => category.categoryId,
    );

    const xp = user.experiencePoints;
    const level = user.userLevel;

    const taskFlows = await this.prisma.taskFlow.findMany({
      where: {
        userExperiencePointsMin: { lte: xp },
        userExperiencePointsMax: { gte: xp },
        categoryRequirements: {
          some: {
            minLevel: { lte: level },
            maxLevel: { gte: level },
            category: {
              id: { in: userCategoryIds },
            },
          },
        },
      },
      include: {
        tasks: true,
        categoryRequirements: {
          include: {
            category: true,
          },
        },
      },
    });

    for (const taskFlow of taskFlows) {
      for (const task of taskFlow.tasks) {
        await this.prisma.taskHistory.upsert({
          where: {
            userId_taskId: {
              userId: user.id,
              taskId: task.id,
            },
          },
          update: {
            isCompleted: false,
          },
          create: {
            userId: user.id,
            taskId: task.id,
            taskflowId: taskFlow.id,
            categoryId: taskFlow.categoryRequirements[0].category.id,
            isCompleted: false,
            baseCategory:
              taskFlow.categoryRequirements[0].category.baseCategory,
            userLevel: user.userLevel,
          },
        });
      }
    }

    await this.assignNewTasks(user);

    return {
      success: true,
      message:
        "You've successfully completed Quiz. Now you can move to assigned tasks in Trainingplans",
    };
  }

  async updateUserTaskStatus(user: User, taskData) {
    const { taskId, taskflowId, categoryId, isCompleted, baseCategory } =
      taskData;

    // await this.prisma.taskHistory.update({
    //   where: {
    //     userId_taskId: {
    //       userId: user.id,
    //       taskId: taskId,
    //     },
    //   },
    //   data: {
    //     userId: user.id,
    //     taskId: taskId,
    //     taskflowId: taskflowId,
    //     categoryId: categoryId,
    //     isCompleted: isCompleted,
    //     baseCategory: baseCategory,
    //     userLevel: user.userLevel,
    //   },
    // });

    await this.prisma.taskHistory.upsert({
      where: {
        userId_taskId: {
          userId: user.id,
          taskId: taskId,
        },
      },
      update: {
        userId: user.id,
        taskId: taskId,
        taskflowId: taskflowId,
        categoryId: categoryId,
        isCompleted: isCompleted,
        baseCategory: baseCategory,
        userLevel: user.userLevel,
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
        categoryParametersToEarn: true,
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

      // Add XP points to user profile
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

        //add completedTasks.length to user's completedTaskCount variable
      }

      const categoryList = taskflow.categoryParametersToEarn.map((category) => {
        return {
          id: category.categoryId,
          value: category.valueToEarn,
        };
      });

      const updatedUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { categories: true },
      });

      for (const userCategory of updatedUser.categories) {
        const matchingCategory = categoryList.find(
          (taskCategory) => taskCategory.id === userCategory.categoryId,
        );

        if (matchingCategory) {
          await this.prisma.userCategory.update({
            where: {
              id: userCategory.id,
            },
            data: {
              earnedXP: {
                increment: matchingCategory.value,
              },
            },
          });
        }
      }

      const matchedLevel = await this.prisma.levelRange.findFirst({
        where: {
          userLevel: { gt: user.userLevel },
          minXP: { lte: user.experiencePoints },
        },
        orderBy: {
          userLevel: 'asc',
        },
      });

      if (matchedLevel) {
        await this.prisma.user.update({
          data: {
            userLevel: matchedLevel.userLevel,
          },
          where: {
            id: user.id,
          },
        });
      }
    }
  }

  async categoryAnalysis(user: User) {
    const baseCategories = [
      'JOY_OF_LIFE',
      'PERSONAL_GROWTH',
      'EMOTIONAL_STRENGTH',
      'RELATIONSHIPS',
    ];

    const allTaskData = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
        userLevel: user.userLevel,
      },
    });

    const completedTaskData = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
        userLevel: user.userLevel,
        isCompleted: true,
      },
    });

    const taskSummary = baseCategories.reduce((acc, category) => {
      acc[category] = {
        baseCategory: category,
        totalTask: 0,
        completedTask: 0,
        percentage: 0,
      };
      return acc;
    }, {});

    allTaskData.forEach((task) => {
      const baseCategory = task.baseCategory;
      if (taskSummary[baseCategory]) {
        taskSummary[baseCategory].totalTask++;
      }
    });

    completedTaskData.forEach((task) => {
      const baseCategory = task.baseCategory;
      if (taskSummary[baseCategory]) {
        taskSummary[baseCategory].completedTask++;
      }
    });

    let totalTask = 0;
    let totalCompletedTask = 0;

    Object.values(taskSummary).forEach((category: any) => {
      if (category.totalTask > 0) {
        category.percentage =
          (category.completedTask / category.totalTask) * 100;
      }

      totalTask += category.totalTask;
      totalCompletedTask += category.completedTask;
    });

    const totalPercentage =
      totalTask > 0 ? (totalCompletedTask / totalTask) * 100 : 0;

    const taskStatus = Object.values(taskSummary);

    const nextLevel = user.userLevel + 1;

    const nextLevelXP = await this.prisma.levelRange.findFirst({
      where: {
        userLevel: nextLevel || 1000,
      },
    });

    return {
      currentXP: user.experiencePoints,
      nextLevelXP: nextLevelXP ? nextLevelXP.minXP : 0,
      currentLevel: user.userLevel,
      totalPercentage: totalPercentage,
      taskStatus: taskStatus,
    };
  }

  async sendQuizResult(user: User, data) {
    const { taskFlowId, parameterValues } = data;

    const taskflow = await this.prisma.taskFlow.findFirst({
      where: {
        id: taskFlowId,
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
    // console.log("taskflow= ",taskflow);

    const results = Array.isArray(taskflow?.results) ? taskflow.results : [];

    function calculateDynamicDistance(
      resultParams: Record<string, number>,
      inputParams: Record<string, number>,
    ) {
      let sumOfSquares = 0;

      for (const key in resultParams) {
        if (inputParams[key] !== undefined) {
          sumOfSquares += Math.pow(resultParams[key] - inputParams[key], 2);
        }
      }

      return Math.sqrt(sumOfSquares);
    }

    function isMatchingParametersObject(
      obj: any,
    ): obj is { matchingParameters: Record<string, number> } {
      return (
        obj &&
        typeof obj === 'object' &&
        'matchingParameters' in obj &&
        typeof obj.matchingParameters === 'object'
      );
    }

    let closestResult = null;
    let smallestDistance = Infinity;

    for (const result of results) {
      if (isMatchingParametersObject(result)) {
        const distance = calculateDynamicDistance(
          result.matchingParameters,
          parameterValues,
        );
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestResult = result;
        }
      }
    }
    console.log('closestResult = ', closestResult);

    // Set affirmations in userAffirmation table
    await this.prisma.userAffirmation.create({
      data: {
        userId: user.id,
        affirmation: closestResult.affirmations,
        isChecked: false,
      },
    });

    // for (const task of taskflow.tasks) {
    //   await this.prisma.taskHistory.update({
    //     where: {
    //       userId_taskId: {
    //         userId: user.id,
    //         taskId: task.id,
    //       },
    //     },
    //     data: {
    //       isCompleted: true,
    //     },
    //   });
    // }
    for (const task of taskflow.tasks) {
      await this.prisma.taskHistory.upsert({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId: task.id,
          },
        },
        update: {
          isCompleted: true,
        },
        create: {
          userId: user.id,
          taskId: task.id,
          taskflowId: taskflow.id,
          categoryId: taskflow.categoryRequirements[0].category.id,
          isCompleted: true,
          baseCategory: taskflow.categoryRequirements[0].category.baseCategory,
          userLevel: user.userLevel,
        },
      });
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        experiencePoints: {
          increment: taskflow.userExperiencePointsToEarn,
        },
        quizzesCompleted: {
          increment: taskflow.tasks.length,
        },
      },
    });

    const matchedLevel = await this.prisma.levelRange.findFirst({
      where: {
        userLevel: { gt: user.userLevel },
        minXP: { lte: user.experiencePoints },
      },
      orderBy: {
        userLevel: 'asc',
      },
    });

    if (matchedLevel) {
      await this.prisma.user.update({
        data: {
          userLevel: matchedLevel.userLevel,
        },
        where: {
          id: user.id,
        },
      });
    }

    await this.assignNewTasks(user);

    return closestResult;
  }

  async assignNewTasks(user: User) {
    const categories = await this.prisma.categories.findMany({
      where: {
        level: { equals: user.userLevel },
      },
    });

    const categoryIds = categories.map((cat) => cat.id);

    const xp = user.experiencePoints;
    const level = user.userLevel;

    const taskFlows = await this.prisma.taskFlow.findMany({
      where: {
        userExperiencePointsMin: { lte: xp },
        userExperiencePointsMax: { gte: xp },
        categoryRequirements: {
          some: {
            minLevel: { lte: level },
            maxLevel: { gte: level },
            categoryId: { in: categoryIds },
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

    const taskFlowIds = taskFlows.map((taskflow) => taskflow.id);

    const existingTaskHistory = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
        taskflowId: { in: taskFlowIds },
      },
      select: {
        taskflowId: true,
      },
    });

    const existingTaskFlowIds = existingTaskHistory.map(
      (taskflow) => taskflow.taskflowId,
    );

    const newTaskFlowIds = taskFlowIds.filter(
      (value) => !existingTaskFlowIds.includes(value),
    );

    const newTaskFlows = await this.prisma.taskFlow.findMany({
      where: {
        id: { in: newTaskFlowIds },
      },
      include: {
        tasks: true,
        categoryRequirements: {
          include: {
            category: true,
          },
        },
      },
    });

    await Promise.all(
      newTaskFlows.map(async (taskFlow) =>
        Promise.all(
          taskFlow.tasks.map((task) =>
            this.prisma.taskHistory.upsert({
              where: {
                userId_taskId: {
                  userId: user.id,
                  taskId: task.id,
                },
              },
              update: {
                isCompleted: false,
              },
              create: {
                userId: user.id,
                taskId: task.id,
                taskflowId: taskFlow.id,
                categoryId: taskFlow.categoryRequirements[0].category.id,
                isCompleted: false,
                baseCategory:
                  taskFlow.categoryRequirements[0].category.baseCategory,
                userLevel: user.userLevel,
              },
            }),
          ),
        ),
      ),
    );
  }

  async getUserTaskHistory(user: User) {
    return this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async getAllUserCompletedTasks(user: User) {
    const taskHistory = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    let completedTaskflows = [];

    for (let item of taskHistory) {
      const taskFlow = await this.prisma.taskFlow.findFirst({
        where: {
          id: item.taskflowId,
        },
        include: {
          tasks: true,
          categoryRequirements: true,
        },
      });

      completedTaskflows.push(taskFlow);
    }

    return completedTaskflows;
  }

  async getSelectedUserCompletedTasks(user: User, baseCategory) {
    const taskHistory = await this.prisma.taskHistory.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    let completedTaskflows = [];

    for (let item of taskHistory) {
      const taskFlow = await this.prisma.taskFlow.findFirst({
        where: {
          id: item.taskflowId,
          categoryRequirements: {
            some: {
              category: {
                baseCategory: {
                  equals: baseCategory,
                },
              },
            },
          },
        },
        include: {
          tasks: true,
          categoryRequirements: {
            include: {
              category: true,
            },
          },
        },
      });

      completedTaskflows.push(taskFlow);
    }

    return completedTaskflows;
  }

  async getAllAffirmations(user: User) {
    return this.prisma.userAffirmation.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async updateAffirmation(user: User, id: string) {
    const affirmation = await this.prisma.userAffirmation.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    return this.prisma.userAffirmation.update({
      where: {
        id: id,
        userId: user.id,
      },
      data: {
        isChecked: !affirmation.isChecked,
      },
    });
  }

  async deleteAffirmation(user: User, id: string) {
    return this.prisma.userAffirmation.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });
  }
}
