import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { contentTypes, taskFlowType, taskType } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Solve coding challenge',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'This task requires solving a coding problem.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

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

  @IsNotEmpty()
  @IsEnum(contentTypes)
  type: contentTypes;

  @IsOptional()
  @IsArray()
  answers?: CreateAnswerDto[];

  @ApiProperty({
    description: 'An array of category requirements for the task',
    example: [],
  })
  @IsOptional()
  @IsArray()
  categoryRequirements: any[];

  @IsOptional()
  @IsArray()
  taskFlow: CreateTaskFlowDto[];

  // add taskttype
  @IsNotEmpty()
  @IsEnum(taskType)
  taskType: taskType;
}

export class CreateAnswerDto {
  questionId: string;
  answerText: string;
  imageURL?: string;
  tagsToEarn?: string[];
}

export class CreateTaskFlowDto {
  title: string;
  description?: string;
  userExperiencePointsMin: number;
  userExperiencePointsMax: number;
  taskFlowType: taskFlowType;
  userExperiencePointsToEarn: number;
}