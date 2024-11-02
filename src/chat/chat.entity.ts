import { ApiProperty } from '@nestjs/swagger';

export class ChatEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  messageType: string;

  @ApiProperty()
  answerType: string;

  @ApiProperty({ type: [String] })
  answerOptions: string[];

  @ApiProperty()
  diaryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
