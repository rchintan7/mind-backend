import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { diaryTypes, Prisma } from '@prisma/client'; // Only use Prisma for types
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatEntity } from './chat.entity'; // Import the entity for Swagger
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/models/user.model';
import { UserEntity } from '../common/decorators/user.decorator';
import { GetChatByDiaryIdAndTypeDto } from './dto/get-chat-by-diary.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get all chats
  @Get()
  @ApiOperation({ summary: 'Get all chats' })
  @ApiResponse({
    status: 200,
    description: 'List of all chats',
    type: [ChatEntity],
  })
  async getAllChats(): Promise<ChatEntity[]> {
    return this.chatService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }

  // Create a new chat
  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({
    status: 201,
    description: 'The created chat',
    type: ChatEntity,
  })
  async createChat(
    @Body() chatData: Prisma.chatCreateInput,
  ): Promise<ChatEntity> {
    return this.chatService.createChat(chatData);
  }

  // Get chats by diaryId
  @Get('/diary/:diaryId')
  @ApiOperation({ summary: 'Get chats by diary ID' })
  @ApiResponse({
    status: 200,
    description: 'List of chats by diary ID',
    type: [ChatEntity],
  })
  async getChatsByDiaryId(
    @Param('diaryId') diaryId: string,
  ): Promise<ChatEntity[]> {
    return this.chatService.findChatsByDiaryId(diaryId);
  }

  @Post('/user/answer')
  @ApiOperation({ summary: 'Store user answer for chat question' })
  @ApiResponse({ status: 200, description: 'Answer stored successfully' })
  async storeUserAnswer(
    @Body() answerDto: { diaryId: string; answer: string[]; freeText?: string },
  ) {
    return this.chatService.storeUserAnswer(
      answerDto.diaryId,
      answerDto.answer,
      answerDto.freeText, // Pass the 'free' parameter to the service method
    );
  }

  // Get chats by diaryId
  @Get('/diarytype/:diaryId/:diaryType')
  @ApiOperation({ summary: 'Get chats by diary ID and type' })
  @ApiResponse({
    status: 200,
    description: 'List of chats by diary ID and type',
    type: [ChatEntity],
  })
  async getchatByDiaryIdAndType(
    @Param() params: GetChatByDiaryIdAndTypeDto,
  ): Promise<ChatEntity[]> {
    return this.chatService.getchatByDiaryIdAndType(
      params.diaryId,
      params.diaryType,
    );
  }
}
