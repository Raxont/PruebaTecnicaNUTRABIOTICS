import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        id: 'user-id',
        email: signUpDto.email,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        role: UserRole.PATIENT,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await service.signUp(signUpDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(signUpDto.email);
    });

    it('should throw error if user already exists', async () => {
      const signUpDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: signUpDto.email,
      });

      await expect(service.signUp(signUpDto)).rejects.toThrow('User already exists');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: signInDto.email,
        password: '$2a$10$hashedpassword', // bcrypt hash
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PATIENT,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await service.signIn(signInDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(signInDto.email);
    });

    it('should throw error for invalid credentials', async () => {
      const signInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid credentials');
    });
  });
});