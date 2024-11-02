import { Module } from '@nestjs/common';
import { UserLevelService } from './userLevel.service';
import { UserLevelController } from './userLevel.controller';

@Module({
  controllers: [UserLevelController],
  providers: [UserLevelService],
})
export class UserLevelModule {}
