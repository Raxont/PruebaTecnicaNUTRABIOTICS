import { Controller, Post, Body, Res, UseGuards, Request, Get, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, AuthResponseDto } from './auth.dto';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const role = signUpDto.role || UserRole.PATIENT;
    return this.authService.signUp(signUpDto, role);
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const role = signUpDto.role || UserRole.PATIENT;
    return this.authService.signUp(signUpDto, role);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  /**
   * Sign in con HTTP-Only cookies (más seguro)
   */
  @Post('sign-in-cookies')
  async signInWithCookies(
    @Body() signInDto: SignInDto,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.signInWithCookies(signInDto, res);
    res.json(authResponse);
  }

  /**
   * Logout: limpiar cookies
   */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res() res: Response): Promise<void> {
    const response = this.authService.logout(res);
    res.json(response);
  }

  /**
   * Refresh token desde cookies
   */
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Request() req, @Res() res: Response): Promise<void> {
    const newAccessToken = await this.authService.refreshToken(req.user.userId);
    
    // Actualizar la cookie con el nuevo token
    res.cookie('accessToken', newAccessToken.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.JWT_ACCESS_TTL) * 1000,
      path: '/',
    });

    res.json(newAccessToken);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req): Promise<any> {
    return {
      id: req.user.userId,
      role: req.user.role,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req): Promise<any> {
    return this.getProfile(req);
  }
}
