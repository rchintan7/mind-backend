import { IsEmail } from 'class-validator';

export class ForgotPasswordInput {
  @IsEmail()
  email: string;
}
