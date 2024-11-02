import { Module } from '@nestjs/common';
import { UserCategoriesController } from './userCategories.controller';
import { UserCategoriesService } from './userCategories.service';

@Module({
  imports: [],
  providers: [UserCategoriesService],
  controllers: [UserCategoriesController],
})
export class UserCategoriesModule {}
