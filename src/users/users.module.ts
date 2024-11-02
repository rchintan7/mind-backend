import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';
import { MoodsModule } from '../moods/moods.module';

@Module({
  imports: [MoodsModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
