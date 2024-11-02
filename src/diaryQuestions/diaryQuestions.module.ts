import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { DiaryQuestionsController } from './diaryQuestions.controller';
import { DiaryQuestionsService } from './diaryQuestions.service';

@Module({
  controllers: [DiaryQuestionsController],
  providers: [DiaryQuestionsService, PrismaService],
})
export class DiaryQuestionsModule {}
