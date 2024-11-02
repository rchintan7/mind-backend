import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  IsUUID,
} from 'class-validator';
import { contentTypes } from '@prisma/client';

export class CreateContentDto {
  @ApiProperty({ description: 'Title of the content' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the content' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of content', enum: contentTypes })
  @IsNotEmpty()
  @IsEnum(contentTypes)
  type: contentTypes;

  @ApiProperty({
    description: 'The file to upload',
    type: 'string',
    format: 'binary',
  })
  file: any;

  @IsOptional()
  @IsInt()
  userExperiencePointsMin: number;

  @IsOptional()
  @IsInt()
  userExperiencePointsMax: number;

  @ApiProperty({
    description: 'Tags for the content',
    example: ['education', 'training', 'motivation'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string;

  @ApiProperty({
    description: 'Categories associated with the content',
    example: ['category1-id', 'category2-id'],
  })
  @IsOptional()
  @IsArray()
  categories: CategoryContentDto[];

  @ApiProperty({
    description: 'ID of the user who created the content',
    example: 'user-id-uuid',
  })
  @IsNotEmpty()
  createdById: string;
}

export class CategoryContentDto {
  id: string;

  @IsString()
  title?: string;

  @IsInt()
  max: number;

  @IsInt()
  min: number;
}

import { PartialType } from '@nestjs/mapped-types';
export class UpdateContentDto extends PartialType(CreateContentDto) {}
