import { IsString, IsOptional, IsArray, IsInt, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { baseCategory } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsInt()
  categoryPoints?: number;

  @IsInt()
  level?: number;

  @IsArray()
  levels: {
    level: number;
    minXP: number;
    maxXP: number;
  }[];

  @IsEnum(baseCategory)
  baseCategory: baseCategory;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
