import { BaseModel } from '../../common/models/base.model';
import { User } from '../../users/models/user.model';
import { Category } from './category.model';

export class UserCategory extends BaseModel {
  userId: string; // userId for efficient queries
  categoryId: string; // categoryId for efficient queries
  user?: User;
  category?: Category;
  level: number;

  constructor(partial: Partial<UserCategory>) {
    super();
    Object.assign(this, partial);
  }
}
