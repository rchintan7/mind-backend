import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DiaryQuestionsService } from './diaryQuestions.service';
import { CreateDiaryQuestionDto } from './dto/create-diary-question.dto';
import { UpdateDiaryQuestionDto } from './dto/update-diary-question.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('diary-questions')
@Controller('diary-questions')
@UseGuards(JwtAuthGuard)
export class DiaryQuestionsController {
  constructor(private readonly diaryQuestionsService: DiaryQuestionsService) {}

  @Post()
  create(@Body() createDiaryQuestionDto: CreateDiaryQuestionDto) {
    return this.diaryQuestionsService.create(createDiaryQuestionDto);
  }

  @Get()
  findAll() {
    return this.diaryQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diaryQuestionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiaryQuestionDto: UpdateDiaryQuestionDto,
  ) {
    return this.diaryQuestionsService.update(id, updateDiaryQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diaryQuestionsService.remove(id);
  }
}
