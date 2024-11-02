import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { answers, taskFlow, ...taskData } = createTaskDto;

    return this.prisma.task.create({
      data: {
        ...taskData,
        taskFlow: {
          create: taskFlow.map((flow) => ({
            title: flow.title,
            description: flow.description,
            userExperiencePointsMin: flow.userExperiencePointsMin,
            userExperiencePointsMax: flow.userExperiencePointsMax,
            taskFlowType: flow.taskFlowType,
            userExperiencePointsToEarn: flow.userExperiencePointsToEarn,
          })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.task.findMany();
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { answers, taskFlow, ...taskData } = updateTaskDto;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        taskFlow: {
          deleteMany: {},
          create: taskFlow.map((flow) => ({
            title: flow.title,
            description: flow.description,
            userExperiencePointsMin: flow.userExperiencePointsMin,
            userExperiencePointsMax: flow.userExperiencePointsMax,
            taskFlowType: flow.taskFlowType,
            userExperiencePointsToEarn: flow.userExperiencePointsToEarn,
          })),
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
