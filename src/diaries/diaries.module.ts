import { Module } from '@nestjs/common';
import { DiariesService } from './diaries.service';
import { DiariesController } from './diaries.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [DiariesController],
  providers: [DiariesService],
})
export class DiariesModule {}
