import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Category } from './models/category.model';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-categories.dto';
import { baseCategory } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Create a new category
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const baseCategoryEnum =
      baseCategory[createCategoryDto.baseCategory as keyof typeof baseCategory];

    return this.prisma.categories.create({
      data: {
        title: createCategoryDto.title,
        description: createCategoryDto.description,
        tags: createCategoryDto.tags,
        levels: {
          create: createCategoryDto.levels.map((level) => ({
            level: level.level,
            minXP: level.minXP,
            maxXP: level.maxXP,
          })),
        },
        baseCategory: baseCategoryEnum,
      },
    });
  }

  // Fetch all categories
  async findAll(): Promise<Category[]> {
    return this.prisma.categories.findMany({
      include: {
        parameters: true,
        levels: true,
        categoryParameterToEarn: true,
        taskCategoryRequirement: true,
      },
    });
  }

  // Fetch a single category by ID
  async findOne(id: string): Promise<Category> {
    return this.prisma.categories.findUnique({
      where: { id },
      include: { parameters: true },
    });
  }

  // Update a category by ID
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.prisma.categories.update({
      where: { id },
      data: {
        title: updateCategoryDto.title,
        description: updateCategoryDto.description,
        tags: updateCategoryDto.tags,
        categoryPoints: updateCategoryDto.categoryPoints,
        levels: {
          deleteMany: {},
          create: updateCategoryDto.levels.map((level) => ({
            level: level.level,
            minXP: level.minXP,
            maxXP: level.maxXP,
          })),
        },
      },
    });
  }

  // Delete a category by ID and all Category Levels
  async remove(id: string) {
    // Delete all Category Levels
    await this.prisma.categoryLevel.deleteMany({
      where: { categoryId: id },
    });

    // Delete CategoryParameterTOEarn
    await this.prisma.categoryParameterToEarn.deleteMany({
      where: { categoryId: id },
    });

    // Delete TaskCategroyRequirement
    await this.prisma.taskCategoryRequirement.deleteMany({
      where: { categoryId: id },
    });

    return this.prisma.categories.delete({
      where: { id },
    });
  }
}
