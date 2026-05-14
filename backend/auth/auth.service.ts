import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, SignInDto, AuthResponseDto } from './auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto, role: UserRole = UserRole.PATIENT): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = signUpDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Create related profile when registering doctor or patient
    if (role === UserRole.DOCTOR) {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
        },
      });
    }

    if (role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
      },
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
      },
    };
  }

  /**
   * Establece cookies HTTP-Only seguras con los tokens
   * Esto es más seguro que enviar en el body
   */
  async signInWithCookies(signInDto: SignInDto, res: Response): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.role);

    // Configurar cookies HTTP-Only seguras
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
      },
    };
  }

  /**
   * Establece las cookies HTTP-Only
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessTokenExpiresIn = parseInt(process.env.JWT_ACCESS_TTL) * 1000; // segundos a ms
    const refreshTokenExpiresIn = parseInt(process.env.JWT_REFRESH_TTL) * 1000;

    // Access Token (corta duración)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpiresIn,
      path: '/',
    });

    // Refresh Token (larga duración)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenExpiresIn,
      path: '/',
    });
  }

  /**
   * Extrae el token de las cookies
   */
  getTokenFromCookies(req: any): string | null {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedException('No token found in cookies');
    }
    return token;
  }

  /**
   * Logout: limpia las cookies
   */
  logout(res: Response) {
    res.clearCookie('accessToken', { path: '/', domain: 'localhost' });
    res.clearCookie('refreshToken', { path: '/', domain: 'localhost' });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL as any },
    );

    return { accessToken };
  }

  private generateTokens(userId: string, role: UserRole) {
    const accessTokenExpiresIn = process.env.JWT_ACCESS_TTL || '900';
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_TTL || '604800';

    const accessToken = this.jwtService.sign(
      { sub: userId, role },
      { 
        secret: process.env.JWT_ACCESS_SECRET, 
        expiresIn: accessTokenExpiresIn as any
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, role },
      { 
        secret: process.env.JWT_REFRESH_SECRET, 
        expiresIn: refreshTokenExpiresIn as any
      },
    );

    return { accessToken, refreshToken };
  }
}
