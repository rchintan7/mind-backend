import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { diaryTypes } from '@prisma/client';

export class CreateDiaryQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsEnum(diaryTypes)
  @IsNotEmpty()
  type: diaryTypes;
}
