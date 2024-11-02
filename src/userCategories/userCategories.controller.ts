import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { UserCategoriesService } from './userCategories.service';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from '../users/models/user.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserCategoriesController {
  constructor(private readonly userCategoriesService: UserCategoriesService) {}

  // Assign value to user categories
  @Post('/categories-assign')
  setUserCategories(@UserEntity() user: User, @Body() data) {
    return this.userCategoriesService.setUserCategories(user, data.selectedCategories);
  }

  @Post('/task-completed')
  updateUserTaskStatus(@UserEntity() user: User, @Body() data) {
    return this.userCategoriesService.updateUserTaskStatus(user, data);
  }

  @Get('/category-analysis')
  categoryAnalysis(@UserEntity() user: User) {
    return this.userCategoriesService.categoryAnalysis(user);
  }

  @Post('/quiz-result')
  sendQuizResult(@UserEntity() user: User, @Body() data) {
    return this.userCategoriesService.sendQuizResult(user, data)
  }

  @Get('/task-history')
  getUserTaskHistory(@UserEntity() user: User) {
    return this.userCategoriesService.getUserTaskHistory(user)
  }

  @Get('/all-completed-tasks')
  getAllUserCompletedTasks(@UserEntity() user: User) {
    return this.userCategoriesService.getAllUserCompletedTasks(user);
  }

  @Get('/selected-completed-tasks/:baseCategory')
  getSelectedUserCompletedTasks(@UserEntity() user: User, @Param('baseCategory') baseCategory,) {
    return this.userCategoriesService.getSelectedUserCompletedTasks(user, baseCategory);
  }

  @Get('/affirmations')
  getAllAffirmations(@UserEntity() user: User) {
    return this.userCategoriesService.getAllAffirmations(user)
  }

  @Patch('/affirmation/:id')
  updateAffirmation(@UserEntity() user: User, @Param('id') id: string) {
    return this.userCategoriesService.updateAffirmation(user, id);
  }

  @Delete('/affirmation/:id')
  deleteAffirmation(@UserEntity() user: User, @Param('id') id: string) {
    return this.userCategoriesService.deleteAffirmation(user, id);
  }
}
