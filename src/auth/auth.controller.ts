import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from './models/auth.model';
import { Token } from './models/token.model';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupInput): Promise<Auth> {
    signupInput.email = signupInput.email.toLowerCase();
    const quiz = signupInput.quiz;

    delete signupInput.quiz;

    const { accessToken, refreshToken } = await this.authService.createUser(
      signupInput,
      quiz,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginInput: LoginInput): Promise<Auth> {
    const { email, password } = loginInput;
    console.log(loginInput);
    const { accessToken, refreshToken } = await this.authService.login(
      email.toLowerCase(),
      password,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenInput: RefreshTokenInput,
  ): Promise<Token> {
    return this.authService.refreshToken(refreshTokenInput.token);
  }

  @Post('forgot-password')
  @ApiTags('auth')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async forgotPassword(
    @Body() forgotPasswordData: ForgotPasswordInput,
  ): Promise<{ status: number; message: string }> {
    return await this.authService.forgotPassword(forgotPasswordData.email);
  }

  @Post('check-email')
  @HttpCode(200)
  @ApiTags('auth')
  @ApiOperation({ summary: 'Check if email is already registered' })
  @ApiResponse({ status: 200, description: 'Email check successful' })
  async checkEmail(
    @Body('email') email: string,
  ): Promise<{ isRegistered: boolean }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const isRegistered = await this.authService.checkIfEmailExists(
      email.toLowerCase(),
    );
    return { isRegistered };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<string> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    await this.authService.verifyEmail(token);

    return 'Email verified successfully';
  }
}
