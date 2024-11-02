import { Module } from '@nestjs/common';
import { TaskFlowService } from './taskflow.service';
import { TaskFlowController } from './taskflow.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [TaskFlowController],
  providers: [TaskFlowService, PrismaService],
})
export class TaskFlowModule {}
