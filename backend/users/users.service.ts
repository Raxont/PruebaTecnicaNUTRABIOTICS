import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserResponseDto } from './users.dto';
import { UserRole } from '@prisma/client';
import { UserFiltersDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, role } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Create related profile if doctor
    if (role === UserRole.DOCTOR) {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Create related profile if patient
    if (role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    return this.formatUserResponse(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserResponse(user);
  }

  async getUsers(filters: UserFiltersDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      order,
      role,
      query,
    } = filters;

    const skip = (page - 1) * limit;
    const actualSortOrder = order || sortOrder;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: actualSortOrder,
      },
    });

    return {
      data: users.map(user => this.formatUserResponse(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: string, data: Partial<CreateUserDto>): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.formatUserResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  private formatUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
    };
  }
}
