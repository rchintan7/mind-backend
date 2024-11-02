import { Injectable, NotFoundException } from '@nestjs/common';
import { diaryTypes, diaryQuestions } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateDiaryQuestionDto } from './dto/create-diary-question.dto';
import { UpdateDiaryQuestionDto } from './dto/update-diary-question.dto';

@Injectable()
export class DiaryQuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDiaryQuestionDto: CreateDiaryQuestionDto,
  ): Promise<diaryQuestions> {
    return this.prisma.diaryQuestions.create({
      data: createDiaryQuestionDto,
    });
  }

  async findAll(): Promise<diaryQuestions[]> {
    return this.prisma.diaryQuestions.findMany();
  }

  async findOne(id: string): Promise<diaryQuestions> {
    const question = await this.prisma.diaryQuestions.findUnique({
      where: { id },
    });
    if (!question)
      throw new NotFoundException(`Diary Question with ID ${id} not found`);
    return question;
  }

  async update(
    id: string,
    updateDiaryQuestionDto: UpdateDiaryQuestionDto,
  ): Promise<diaryQuestions> {
    await this.findOne(id); // Check if it exists
    return this.prisma.diaryQuestions.update({
      where: { id },
      data: updateDiaryQuestionDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if it exists
    await this.prisma.diaryQuestions.delete({ where: { id } });
  }
}
