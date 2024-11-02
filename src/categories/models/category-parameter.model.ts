import { BaseModel } from '../../common/models/base.model';
import { Category } from './category.model';

export class CategoryParameter extends BaseModel {
  title: string;
  type: string;
  defaultValue: string;
  minValue: number;
  maxValue: number;
  step: number;
  categoryId: string; // Include categoryId for efficient queries
  category?: Category;

  constructor(partial: Partial<CategoryParameter>) {
    super();
    Object.assign(this, partial);
  }
}
