// CreateTaskFlowDto
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsInt,
  ValidateNested,
  IsObject,
} from 'class-validator';

export class CreateTaskFlowDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  taskFlowType: taskFlowType;

  @IsOptional()
  @IsString()
  imageURL?: string;

  @IsOptional()
  @IsString()
  videoURL?: string;

  @IsOptional()
  @IsString()
  audioURL?: string;

  @IsInt()
  userExperiencePointsMin: number;

  @IsInt()
  userExperiencePointsMax: number;

  @IsInt()
  userExperiencePointsToEarn: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks: CreateTaskDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryRequirementDto)
  categories: CategoryRequirementDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchingParameters?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResultDto)
  results?: CreateResultDto[];

  @IsOptional()
  @IsString()
  requiredTimeForTaskFlow?: string;

  @IsOptional()
  @IsString()
  id?: string;
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  taskType: taskType;

  @IsArray()
  @IsOptional()
  tagsToEarn?: string[];

  @IsOptional()
  @IsString()
  type?: contentTypes;

  @IsOptional()
  @IsString()
  file?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @IsOptional()
  @IsObject()
  matchingParameters?: Record<string, string>; // JSON object for matching parameters

  @IsOptional()
  @IsString()
  id: any;

  @IsOptional()
  @IsString()
  confirmationType?: string;

  @IsOptional()
  @IsNumber()
  confirmationAmount?: number;
}

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsString()
  imageURL?: string;

  @IsOptional()
  @IsArray()
  matchingParameters?: Record<string, string>; // JSON object for matching parameters

  @IsOptional()
  @IsString()
  nextTaskId?: string | number;

  @IsOptional()
  @IsString()
  nextTaskflowId?: string;

  @IsOptional()
  @IsString()
  affirmation?: string;
  id: any;
}

export class CategoryRequirementDto {
  @IsOptional()
  @IsString()
  taskTitle: string;

  @IsString()
  categoryId: string;

  @IsInt()
  minLevel: number;

  @IsInt()
  maxLevel: number;

  @IsInt()
  @IsOptional()
  valueToEarn?: number;
}

export class CreateResultDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  affirmations?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  categories?: any;

  @IsOptional()
  @IsInt()
  categoryPoints?: number;

  @IsOptional()
  @IsObject()
  matchingParameters?: Record<string, string>; // JSON object for matching parameters
}

import { PartialType } from '@nestjs/mapped-types';
import { taskFlowType, taskType, contentTypes } from '@prisma/client';
import { Type } from 'class-transformer';
export class UpdateTaskFlowDto extends PartialType(CreateTaskFlowDto) {}
