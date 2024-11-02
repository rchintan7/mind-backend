import { PartialType } from '@nestjs/mapped-types';
import { CreateDiaryQuestionDto } from './create-diary-question.dto';

export class UpdateDiaryQuestionDto extends PartialType(
  CreateDiaryQuestionDto,
) {}
