import { Task } from 'src/tasks/models/task.model';
import { BaseModel } from '../../common/models/base.model';
import { TaskCategoryRequirement } from 'src/categories/models/task-category-requirements.model';
import { taskFlowType } from '@prisma/client';

export class TaskFlow extends BaseModel {
  title: string;
  description?: string;
  taskFlowType: taskFlowType;
  imageURL?: string;
  videoURL?: string;
  audioURL?: string;
  tasks: Task[];
  userExperiencePointsMin: number;
  userExperiencePointsMax: number;
  categoryRequirements: TaskCategoryRequirement[];
  requiredTags: string[];
  tagsToEarn: string[];
}
