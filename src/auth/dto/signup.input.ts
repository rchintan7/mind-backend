import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { loginMethod, role } from '@prisma/client';

export class SignupInput {
  @IsEmail()
  email: string;

  loginMethod: loginMethod;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  firstname?: string;

  userRole?: role;

  lastname?: string;

  appleToken?: string;

  googleToken?: string;

  facebookToken?: string;

  contactNumber?: string;

  @IsOptional()
  @IsString()
  quiz: string;
}
