import { diaryTypes } from '@prisma/client';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class GetChatByDiaryIdAndTypeDto {
  @IsString()
  @IsNotEmpty()
  diaryId: string;

  @IsEnum(diaryTypes)
  @IsNotEmpty()
  diaryType: diaryTypes;
}
