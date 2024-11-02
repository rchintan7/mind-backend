import { BaseModel } from '../../common/models/base.model';
import { CategoryParameter } from './category-parameter.model';
import { UserCategory } from './user-category.model';
import { Content } from '../../content/models/content.model';

export class Category extends BaseModel {
  title: string;
  description: string;
  tags?: string[] | null; // Using a string array as denormalized tags
  parameters?: CategoryParameter[] | null;
  users?: UserCategory[] | null;
  content?: Content[] | null;

  constructor(partial: Partial<Category>) {
    super();
    Object.assign(this, partial);
  }
}
