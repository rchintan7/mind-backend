import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';
import { ChangePasswordInput } from './dto/change-password.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from './models/user.model';
import { TaskFlow } from 'src/taskFlows/models/taskflow.model';
import { baseCategory, userMood } from '@prisma/client';
import { Category } from 'src/categories/models/category.model';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'The found user', type: User })
  async getMe(@UserEntity() user: User): Promise<User> {
    return this.usersService.getMeWithCategories(user.id);
  }

  @Get('taskflows/:baseCategory')
  async getMeTaskFlows(
    @UserEntity() user: User,
    @Param('baseCategory') baseCategory: baseCategory,
  ) {
    return this.usersService.getMeTaskFlows(user, baseCategory);
  }

  @Get('all-taskflows')
  async getAllUserTaskflows(
    @UserEntity() user: User,
  ): Promise<Partial<TaskFlow>[]> {
    return this.usersService.getAllUserTaskflows(user);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'The updated user', type: User })
  async updateUser(
    @UserEntity() user: User,
    @Body() newUserData: Partial<UpdateUserInput>,
  ): Promise<Partial<User>> {
    return this.usersService.updateUser(user.id, newUserData);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @UserEntity() user: User,
    @Body() changePasswordData: ChangePasswordInput,
  ): Promise<void> {
    await this.usersService.changePassword(
      user.id,
      user.password,
      changePasswordData,
    );
  }

  @Patch('change-mood')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user mood' })
  @ApiResponse({ status: 200, description: 'Mood changed successfully' })
  async changeMood(@UserEntity() user: User, @Body() data): Promise<void> {
    await this.usersService.changeMood(user.id, data.mood);
  }

  @Get('feed')
  async userFeed(@UserEntity() user: User) {
    return this.usersService.userFeed(user);
  }

  @Post('social-battery')
  async modifySocialBattery(@UserEntity() user: User, @Body() data) {
    return this.usersService.modifySocialBattery(user, data.socialBattery);
  }

  @Post('like-content/:id')
  async userLikedContent(
    @UserEntity() user: User,
    @Param('id') id: string,
    @Body() data,
  ) {
    return this.usersService.userLikedContent(user, id, data.liked);
  }

  @Get('favorite-content')
  async userFavoriteContents(@UserEntity() user: User) {
    return this.usersService.userFavoriteContents(user);
  }

  @Post('task-status')
  async userTaskHistory(@UserEntity() user: User, @Body() data) {
    return this.usersService.userTaskHistory(user, data);
  }

  @Get('streak')
  async maintainStreak(@UserEntity() user: User) {
    return this.usersService.maintainStreak(user.id);
  }

  @Get('appcount')
  async maintainAppcount(@UserEntity() user: User) {
    return this.usersService.maintainAppcount(user.id);
  }

  @Get('analyse')
  @ApiOperation({ summary: 'Get analyse data for user' })
  @ApiResponse({
    status: 200,
    description: 'analyse data for user get succefully',
  })
  getAnalyseDataForUser(
    @UserEntity() user: User,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.usersService.getAnalyseDataForUser(user.id, month, year);
  }

  @Post('add-quiz')
  addUserQuiz(@UserEntity() user: User, @Body() data) {
    return this.usersService.addUserQuiz(user, data.quizData);
  }

  @Delete()
  deleteUserAccount(@UserEntity() user: User) {
    return this.usersService.deleteUserAccount(user);
  }

  @Delete('/achievements/:id')
  deleteUserAchievementt(@UserEntity() user: User, @Param('id') id: string) {
    return this.usersService.deleteUserAchievementt(user, id);
  }

  @Get('achievements')
  async getAchievementByUser(@UserEntity() user: User) {
    return this.usersService.getAchievementByUser(user);
  }

  @Get('achievements/all')
  async getAchievementsAll(@UserEntity() user: User) {
    return this.usersService.getAchievementsAll();
  }

  @Get('video/view')
  async videoViewCount(@UserEntity() user: User) {
    return this.usersService.videoViewCount(user);
  }
}
