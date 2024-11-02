import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateTaskFlowDto,
  UpdateTaskFlowDto,
} from './dto/create-taskflow.dto';
import { contentTypes } from '@prisma/client';

@Injectable()
export class TaskFlowService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskFlowDto: CreateTaskFlowDto) {
    const {
      tasks,
      categories = [],
      userExperiencePointsToEarn,
      results = [],
      ...taskFlowData
    } = createTaskFlowDto;

    return this.prisma.$transaction(async (prisma) => {
      const createdTaskFlow = await prisma.taskFlow.create({
        data: {
          title: taskFlowData.title,
          description: taskFlowData.description,
          taskFlowType: taskFlowData.taskFlowType,
          imageURL: taskFlowData.imageURL,
          videoURL: taskFlowData.videoURL,
          audioURL: taskFlowData.audioURL,
          userExperiencePointsMin: taskFlowData.userExperiencePointsMin,
          userExperiencePointsMax: taskFlowData.userExperiencePointsMax,
          userExperiencePointsToEarn: userExperiencePointsToEarn,
          requiredTimeForTaskFlow: taskFlowData.requiredTimeForTaskFlow,
          matchingParameters: taskFlowData.matchingParameters,

          // Kategorieparameter erstellen
          categoryParametersToEarn: {
            create: categories.map((category) => ({
              categoryId: category.categoryId,
              valueToEarn: category.valueToEarn,
            })),
          },

          // Kategorienanforderungen erstellen
          categoryRequirements: {
            create: categories.map((requirement) => ({
              categoryId: requirement.categoryId,
              minLevel: requirement.minLevel,
              maxLevel: requirement.maxLevel,
            })),
          },

          // Aufgaben und Antworten erstellen
          tasks: {
            create: tasks.map((task) => ({
              title: task.title,
              description: task.description,
              taskType: task.taskType,
              type:
                task.type === ('' as contentTypes)
                  ? contentTypes.IMAGE
                  : task.type ?? contentTypes.IMAGE,
              imageURL:
                task.type === contentTypes.IMAGE || (!task.type && task.file)
                  ? task.file
                  : null,
              videoURL: task.type === contentTypes.VIDEO ? task.file : null,
              audioURL: task.type === contentTypes.AUDIO ? task.file : null,
              answers: {
                create: task.answers.map((answer) => ({
                  answerText: answer.text,
                  matchingParameters: answer.matchingParameters,
                  imageURL: answer.imageURL,
                  tagsToEarn: answer.tags,
                  affirmationsToEarn:
                    answer.affirmation && answer.affirmation.length > 0
                      ? Array.isArray(answer.affirmation)
                        ? answer.affirmation
                        : [answer.affirmation]
                      : answer.affirmation?.split(',') ?? [],
                  nextTaskId: answer.nextTaskId?.toString() ?? null, // Array Position atm
                  nextTaskFlowId: answer.nextTaskflowId,
                })),
              },
              matchingParameters: task.matchingParameters,
              confirmationAmount: task.confirmationAmount,
              confirmationType: task.confirmationType,
            })),
          },

          // Ergebnisse hinzufügen
          results: results.map((result) => ({
            name: result.name,
            description: result.description,
            affirmations: result.affirmations,
            tags: result.tags,
            categories: result.categories,
            matchingParameters: result.matchingParameters,
          })),
        },
        include: {
          tasks: {
            include: {
              answers: true,
            },
          },
          categoryParametersToEarn: true,
          categoryRequirements: true,
        },
      });
      return createdTaskFlow;
    });
  }

  async findAll() {
    const taskFlows = await this.prisma.taskFlow.findMany({
      include: {
        tasks: {
          include: {
            answers: true,
          },
        },
        categoryRequirements: true,
        categoryParametersToEarn: true,
      },
    });

    // Transform answerText to text in each answer
    return taskFlows.map((taskFlow) => ({
      ...taskFlow,
      tasks: taskFlow.tasks.map((task) => ({
        ...task,
        answers: task.answers.map((answer) => ({
          ...answer,
          text: answer.answerText, // Rename answerText to text
          answerText: undefined, // Optionally remove the original field
        })),
      })),
    }));
  }

  async findOne(id: string) {
    const taskFlow = await this.prisma.taskFlow.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            answers: true,
          },
        },
        categoryRequirements: true,
        categoryParametersToEarn: true,
      },
    });

    if (!taskFlow) return null;

    // Transform answerText to text in each answer
    return {
      ...taskFlow,
      tasks: taskFlow.tasks.map((task) => ({
        ...task,
        answers: task.answers.map((answer) => ({
          ...answer,
          text: answer.answerText, // Rename answerText to text
          answerText: undefined, // Optionally remove the original field
        })),
      })),
    };
  }

  async update(taskFlowId: string, updateTaskFlowDto: UpdateTaskFlowDto) {
    const {
      tasks,
      categories = [],
      userExperiencePointsToEarn,
      results = [],
      ...taskFlowData
    } = updateTaskFlowDto;

    return this.prisma.$transaction(async (prisma) => {
      const existingTaskFlow = await prisma.taskFlow.findUnique({
        where: { id: taskFlowId },
        include: {
          tasks: {
            include: {
              answers: true,
            },
          },
          categoryParametersToEarn: true,
          categoryRequirements: true,
        },
      });

      if (!existingTaskFlow) {
        throw new Error('TaskFlow not found');
      }

      const existingTaskIds = existingTaskFlow.tasks.map((task) => task.id);
      const tasksToCreate = tasks.filter((task) => !task.id);
      const tasksToUpdate = tasks.filter((task) =>
        existingTaskIds.includes(task.id),
      );
      const tasksToDelete = existingTaskFlow.tasks.filter(
        (existingTask) => !tasks.some((task) => task.id === existingTask.id),
      );

      // TaskFlow-Update mit verschachtelter Erstellung der neuen Tasks
      const updatedTaskFlow = await prisma.taskFlow.update({
        where: { id: taskFlowId },
        data: {
          title: taskFlowData.title,
          description: taskFlowData.description,
          taskFlowType: taskFlowData.taskFlowType,
          imageURL: taskFlowData.imageURL,
          videoURL: taskFlowData.videoURL,
          audioURL: taskFlowData.audioURL,
          userExperiencePointsMin: taskFlowData.userExperiencePointsMin,
          userExperiencePointsMax: taskFlowData.userExperiencePointsMax,
          userExperiencePointsToEarn: userExperiencePointsToEarn,
          requiredTimeForTaskFlow: taskFlowData.requiredTimeForTaskFlow,
          matchingParameters: taskFlowData.matchingParameters,

          // Update für Kategorien und Anforderungen
          categoryParametersToEarn: {
            updateMany: categories.map((category) => ({
              where: { categoryId: category.categoryId },
              data: { valueToEarn: category.valueToEarn },
            })),
          },
          categoryRequirements: {
            updateMany: categories.map((requirement) => ({
              where: { categoryId: requirement.categoryId },
              data: {
                minLevel: requirement.minLevel,
                maxLevel: requirement.maxLevel,
              },
            })),
          },

          // Ergebnisse aktualisieren
          results: results.map((result) => ({
            name: result.name,
            affirmations: result.affirmations,
            tags: result.tags,
            categories: result.categories,
            matchingParameters: result.matchingParameters,
            description: result.description,
          })),

          // Aufgaben direkt im TaskFlow erstellen und updaten
          tasks: {
            deleteMany: tasksToDelete.map((task) => ({ id: task.id })), // Tasks löschen
            update: tasksToUpdate.map((task) => {
              const existingAnswers = task.answers.filter(
                (answer) => answer.id,
              );
              const answersToCreate = task.answers.filter(
                (answer) => !answer.id,
              );
              const answersToDelete = task.answers.filter(
                (answer) =>
                  !existingAnswers.some(
                    (existingAnswer) => existingAnswer.id === answer.id,
                  ),
              );

              return {
                where: { id: task.id },
                data: {
                  title: task.title,
                  description: task.description,
                  taskType: task.taskType,
                  type: task.type ?? contentTypes.IMAGE,
                  imageURL:
                    task.type === contentTypes.IMAGE ||
                    (!task.type && task.file)
                      ? task.file
                      : null,
                  videoURL: task.type === contentTypes.VIDEO ? task.file : null,
                  audioURL: task.type === contentTypes.AUDIO ? task.file : null,
                  matchingParameters: task.matchingParameters,
                  answers: {
                    deleteMany: answersToDelete.map((answer) => ({
                      id: answer.id,
                    })),
                    update: existingAnswers.map((answer) => ({
                      where: { id: answer.id },
                      data: {
                        answerText: answer.text,
                        matchingParameters: answer.matchingParameters,
                        imageURL: answer.imageURL,
                        tagsToEarn: answer.tags,
                        affirmationsToEarn: Array.isArray(answer.affirmation)
                          ? answer.affirmation
                          : answer.affirmation?.split(',') ?? [],
                        nextTaskId: answer.nextTaskId?.toString() ?? null,
                        nextTaskFlowId: answer.nextTaskflowId,
                      },
                    })),
                    create: answersToCreate.map((answer) => ({
                      answerText: answer.text,
                      matchingParameters: answer.matchingParameters,
                      imageURL: answer.imageURL,
                      tagsToEarn: answer.tags,
                      affirmationsToEarn: Array.isArray(answer.affirmation)
                        ? answer.affirmation
                        : answer.affirmation?.split(',') ?? [],
                      nextTaskId: answer.nextTaskId?.toString() ?? null,
                      nextTaskFlowId: answer.nextTaskflowId,
                    })),
                  },

                  confirmationAmount: task.confirmationAmount,
                  confirmationType: task.confirmationType,
                },
              };
            }),
            create: tasksToCreate.map((task) => ({
              title: task.title,
              description: task.description,
              taskType: task.taskType,
              type: task.type ?? contentTypes.IMAGE,
              matchingParameters: task.matchingParameters,
              answers: {
                create: task.answers.map((answer) => ({
                  answerText: answer.text,
                  matchingParameters: answer.matchingParameters,
                  imageURL: answer.imageURL,
                  tagsToEarn: answer.tags,
                  affirmationsToEarn: Array.isArray(answer.affirmation)
                    ? answer.affirmation
                    : answer.affirmation?.split(',') ?? [],
                  nextTaskId: answer.nextTaskId?.toString() ?? null,
                  nextTaskFlowId: answer.nextTaskflowId,
                })),
              },
              confirmationAmount: task.confirmationAmount,
              confirmationType: task.confirmationType,
            })),
          },
        },
        include: {
          tasks: {
            include: {
              answers: true,
            },
          },
          categoryParametersToEarn: true,
          categoryRequirements: true,
        },
      });

      return updatedTaskFlow;
    });
  }

  // Delete a task flow
  async delete(id: string) {
    const taskFlow = await this.prisma.taskFlow.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            answers: true,
          },
        },
        categoryRequirements: true,
        categoryParametersToEarn: true,
      },
    });

    if (!taskFlow) {
      throw new Error('TaskFlow not found');
    }

    const answers = taskFlow.tasks.flatMap((task) => task.answers);
    await this.prisma.answer.deleteMany({
      where: {
        id: {
          in: answers.map((answer) => answer.id),
        },
      },
    });

    // delete related tasks
    await this.prisma.task.deleteMany({
      where: {
        id: {
          in: taskFlow.tasks.map((task) => task.id),
        },
      },
    });

    await this.prisma.taskCategoryRequirement.deleteMany({
      where: {
        id: {
          in: taskFlow.categoryRequirements.map(
            (requirement) => requirement.id,
          ),
        },
      },
    });

    await this.prisma.categoryParameterToEarn.deleteMany({
      where: {
        id: {
          in: taskFlow.categoryParametersToEarn.map(
            (parameter) => parameter.id,
          ),
        },
      },
    });

    return this.prisma.taskFlow.delete({
      where: { id },
    });
  }
}
