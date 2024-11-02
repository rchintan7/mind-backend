import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  messageAfterWakeUp?: string;

  @IsOptional()
  @IsString()
  messageBeforeBedTime?: string;

  @IsOptional()
  @IsInt()
  daysInRow?: number;

  @IsOptional()
  @IsString()
  achievementMessage?: string;

  @IsOptional()
  @IsString()
  missedLoginMessage?: string;

  @IsOptional()
  @IsInt()
  xpThreshold?: number;

  @IsOptional()
  @IsString()
  xpNotificationMessage?: string;

  @IsOptional()
  @IsString()
  midWeekReminder?: string;

  @IsOptional()
  @IsString()
  lastDayReminder?: string;

  @IsOptional()
  @IsString()
  notificationFrequency?: string;

  @IsOptional()
  @IsString()
  notificationTime?: string;

  @IsOptional()
  @IsString()
  dateOfMonth?: string;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  time?: string;
}

import { PartialType } from '@nestjs/mapped-types';
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}