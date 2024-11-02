import { IsEmail } from 'class-validator';
import { BaseModel } from '../../common/models/base.model';
import { role, loginMethod, subscriptionStatus } from '@prisma/client';
import { UserArchivement } from '../../archivements/models/user-archivement.model';
import { UserCategory } from '../../categories/models/user-category.model';
import { Content } from '../../content/models/content.model';

export class User extends BaseModel {
  @IsEmail()
  email: string;

  password: string;

  phoneNumber?: string;

  firstname?: string;

  lastname?: string;

  loginMethod: loginMethod;

  appleToken?: string;

  googleToken?: string;

  facebookToken?: string;

  profilePicture?: string;

  experiencePoints: number;

  userLevel: number;

  lastLogin?: Date;

  subscriptionStatus: subscriptionStatus;

  userRole: role;

  archivements?: UserArchivement[] | null;

  categories?: UserCategory[] | null;

  contents?: Content[] | null;
  socialBattery: any;

  videoCount: number;
  tasksCompleted: number;
  quizzesCompleted: number;
  streakCount: number;
  appOpenCount: number;
  streakUpdatedTime: Date
  lastSeenContent: any;
  likedContents: string[]
}
