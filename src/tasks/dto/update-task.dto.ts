import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { contentTypes, taskFlowType, taskType } from '@prisma/client';

export class CreateAnswerDto {
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  answerText: string;

  @IsOptional()
  imageURL?: string;

  @IsOptional()
  tagsToEarn?: string[];
}

export class CreateTaskFlowDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  userExperiencePointsMin: number;

  @IsNotEmpty()
  userExperiencePointsMax: number;

  @IsNotEmpty()
  @IsEnum(taskFlowType)
  taskFlowType: taskFlowType;

  @IsNotEmpty()
  userExperiencePointsToEarn: number;
}

export class UpdateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Solve coding challenge',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'This task requires solving a coding problem.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Optional URL to an image associated with the task',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageURL?: string;

  @ApiProperty({
    description: 'Optional URL to a video associated with the task',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoURL?: string;

  @ApiProperty({
    description: 'Optional URL to an audio file associated with the task',
    example: 'https://example.com/audio.mp3',
    required: false,
  })
  @IsOptional()
  @IsString()
  audioURL?: string;

  @ApiProperty({
    description: 'Optional text content of the task',
    example: 'This is the task text.',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'The type of content for the task',
    enum: contentTypes,
    required: false,
  })
  @IsOptional()
  @IsEnum(contentTypes)
  type?: contentTypes;

  @ApiProperty({
    description: 'An array of answers for the task',
    type: [CreateAnswerDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  answers?: CreateAnswerDto[];

  @ApiProperty({
    description: 'An array of category requirements for the task',
    example: [],
    required: false,
  })
  @IsOptional()
  @IsArray()
  categoryRequirements?: any[];

  @ApiProperty({
    description: 'An array of task flow definitions for the task',
    type: [CreateTaskFlowDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  taskFlow?: CreateTaskFlowDto[];

  @ApiProperty({
    description: 'The type of task',
    enum: taskType,
    required: false,
  })
  @IsOptional()
  @IsEnum(taskType)
  taskType?: taskType;
}
