import { Task } from 'src/tasks/models/task.model';
import { BaseModel } from '../../common/models/base.model';
import { UserCategory } from './user-category.model';
import { TaskFlow } from 'src/taskFlows/models/taskflow.model';

export class TaskCategoryRequirement extends BaseModel {
  task: Task;
  category: UserCategory;
  minLevel: number;
  maxLevel: number;
  taskFlow: TaskFlow[];
}
