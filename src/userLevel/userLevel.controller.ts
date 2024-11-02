import { Controller, Get, Post, Put, Delete, Param, Body, Patch } from '@nestjs/common';
import { UserLevelService } from './userLevel.service';

@Controller('user-level')
export class UserLevelController {
  constructor(private readonly userLevelService: UserLevelService) {}

  @Post('')
  addUserLevel(@Body() data) {
    return this.userLevelService.addUserLevel(data);
  }

  @Get('')
  getUserLevel() {
    return this.userLevelService.getUserLevel();
  }

  @Patch(':id')
  updateUserLevel(@Param('id') id: string, @Body() data) {
    return this.userLevelService.updateUserLevel(id, data);
  }

  @Delete(':id')
  deleteUserLevel(@Param('id') id: string) {
    return this.userLevelService.deleteUserLevel(id);
  }
}
