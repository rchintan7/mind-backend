import { BaseModel } from '../../common/models/base.model';
import { User } from '../../users/models/user.model';
import { Tag } from '../../tags/models/tag.model';
import { Category } from '../../categories/models/category.model';
import { contentTypes } from '@prisma/client';

export class Content extends BaseModel {
  title: string;
  description: string;
  imageURL?: string;
  videoURL?: string;
  audioURL?: string;
  text?: string;
  type: contentTypes;
  // userLevelRequirement: number;
  // experiencePointsRequirement: number;
  // categoryLevelRequirement: number;
  createdBy: User;
  tags?: string[] | null;
  categories?: Category[] | null;
}
