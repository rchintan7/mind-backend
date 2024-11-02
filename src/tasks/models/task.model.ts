import { BaseModel } from '../../common/models/base.model';
import { contentTypes } from '@prisma/client';

export class Task extends BaseModel {
  title: string;
  description: string;
  imageURL?: string;
  videoURL?: string;
  audioURL?: string;
  text?: string;
  type: contentTypes;

  answers: any[];

  // userExperiencePointsMin: number;
  // userExperiencePointsMax: number;

  categoryRequirements: any[];

  taskFlow: any[];

  constructor(task: Partial<Task>) {
    super();
    Object.assign(this, task);
  }
}
