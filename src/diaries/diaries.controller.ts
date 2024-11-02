import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DiariesService } from './diaries.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from '../users/models/user.model';

@ApiTags('diaries')
@Controller('diaries')
@UseGuards(JwtAuthGuard)
export class DiariesController {
  constructor(private readonly diariesService: DiariesService) {}

  @Get('user/chat')
  @ApiOperation({ summary: 'Get or create today’s diary and start chat flow' })
  @ApiResponse({ status: 200, description: 'Diary and chat flow started' })
  getOrCreateDiaryForUser(
    @UserEntity() user: User,
    @Query('date') date?: string,
  ) {
    return this.diariesService.getOrCreateDiaryForUser(user.id, date);
  }

  @Get('user/diaries')
  @ApiOperation({ summary: 'Get diary and chat data' })
  @ApiResponse({
    status: 200,
    description: 'Diary and chat data get succefully',
  })
  getDiaryForUser(@UserEntity() user: User, @Query('date') date?: string) {
    return this.diariesService.getDiaryForUser(user.id, date);
  }

  @Post()
  create(@Body() createDiaryDto: CreateDiaryDto) {
    return this.diariesService.create(createDiaryDto);
  }

  @Get()
  findAll() {
    return this.diariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diariesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiaryDto: UpdateDiaryDto) {
    return this.diariesService.update(id, updateDiaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diariesService.remove(id);
  }
}
