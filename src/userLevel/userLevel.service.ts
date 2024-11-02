import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UserLevelService {
  constructor(private readonly prisma: PrismaService) {}

  async addUserLevel(userLevelData) {
    return this.prisma.levelRange.create({
        data: userLevelData
    })
  }

  async getUserLevel() {
    return this.prisma.levelRange.findMany();
  }

  async updateUserLevel(id: string, userLevelData) {
    return this.prisma.levelRange.update({
        where: { id },
        data: userLevelData,
    });
  }

  async deleteUserLevel(id: string) {
    return this.prisma.levelRange.delete({
        where: { id },
    });
  }
}
