import { PrismaService } from 'nestjs-prisma';
import { Prisma, user } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import Brevo, { TransactionalEmailsApi } from '@getbrevo/brevo';

@Injectable()
export class AuthService {
  private transactionalEmailsApi: TransactionalEmailsApi;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {
    this.transactionalEmailsApi = new TransactionalEmailsApi();

    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    this.transactionalEmailsApi.setApiKey(0, brevoApiKey);
  }

  async createUser(payload: SignupInput, quiz: string): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          email: payload.email,
          loginMethod: payload.loginMethod,
          emailVerified: payload.loginMethod === 'EMAIL' ? false : true,
          firstname: payload?.firstname ?? '',
          lastname: payload?.lastname ?? '',
          subscriptionStatus: 'ACTIVE',
          password: hashedPassword,
          userRole: payload.userRole ?? 'FREE_USER',
          appleToken: payload.appleToken,
          googleToken: payload.googleToken,
          facebookToken: payload.facebookToken,
          currentMood: 'NORMAL',
        },
      });

      if (quiz && quiz.length > 0) {
        await this.prisma.quizData.create({
          data: {
            email: payload.email,
            quiz: JSON.stringify(quiz),
          },
        });
      }

      if (payload.loginMethod === 'EMAIL') {
        await this.sendVerificationEmail(user.email, user.id);
      }

      const allCategories = await this.prisma.categories.findMany({});
      const categoryIds = allCategories.map((category) => category.id);

      for (let categoryId of categoryIds) {
        await this.prisma.userCategory.create({
          data: {
            userId: user.id,
            categoryId: categoryId,
            level: user.userLevel,
          },
        });
      }

      return this.generateTokens({
        userId: user.id,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  // async sendVerificationEmail(email: string, userId: string): Promise<void> {
  //   const backendUrl = this.configService.get<string>('BACKEND_URL');
  //   // Generate a JWT token for email verification with a short expiration time (e.g., 1 hour)
  //   const verificationToken = this.jwtService.sign(
  //     { userId },
  //     {
  //       secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
  //       expiresIn: '1d',
  //     },
  //   );

  //   // Prepare the verification link
  //   const verificationLink = `${backendUrl}/auth/verify-email?token=${verificationToken}`;

  //   // Prepare email content using Brevo SDK
  //   const emailData = {
  //     sender: { email: 'no-reply@Mind.com', name: 'Mind' },
  //     to: [{ email }],
  //     subject: 'Email Verification',
  //     htmlContent: `
  //       <h3>Email Verification</h3>
  //       <p>Please verify your email by clicking on the link below:</p>
  //       <a href="${verificationLink}">Verify Email</a>
  //     `,
  //   };

  //   try {
  //     // Send the email using Brevo's SDK
  //     await this.brevoClient.sendTransacEmail(emailData);
  //   } catch (error) {
  //     throw new Error(`Failed to send verification email: ${error.message}`);
  //   }
  // }

  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const verificationToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: '1h',
      },
    );

    const verificationLink = `${backendUrl}/auth/verify-email?token=${verificationToken}`;

    // Prepare email data
    const emailData = {
      sender: {
        email: this.configService.get<string>('BREVO_SENDER_EMAIL'),
        name: this.configService.get<string>('BREVO_SENDER_APP'),
      },
      to: [{ email }],
      subject: 'Email Verification',
      htmlContent: `
        <h3>Email Verification</h3>
        <p>Please verify your email by clicking on the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    };

    try {
      // Send transactional email using Brevo API
      await this.transactionalEmailsApi.sendTransacEmail(emailData);
    } catch (error) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // Decode and verify the JWT token
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
      });

      // Update the user's emailVerified status to true
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async login(Email: string, Password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email: Email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${Email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      Password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens({
      userId: user.id,
    });
  }

  validateUser(userId: string): Promise<user> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  getUserFromToken(token: string): Promise<user> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<{ status: number; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const tempPassword = this.generateRandomPassword(12);

    this.mailService.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: email,
      subject: 'Forgot password recovery',
      text: `Your temporary password is --> ${tempPassword}`,
    });

    const hashedPassword = await this.passwordService.hashPassword(
      tempPassword,
    );

    await this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: {
        email: email,
      },
    });

    return {
      status: 200,
      message:
        'Password reset successfully. Please check your email for the temporary password.',
    };
  }

  generateRandomPassword(length: number): string {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('base64').slice(0, length);
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return !!user; // Returns true if user exists, false otherwise
  }
}
