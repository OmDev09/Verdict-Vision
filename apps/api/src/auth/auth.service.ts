import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterUserDto, RegisterLawyerDto, LoginDto } from './dto';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ENROLLMENT_REGEX = /^[A-Z]{2}\/\d{2}\/\d{4,8}$/i; // e.g. BR/20/123456

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.USER,
        credits: 10,
      },
    });
    return this.tokens(user.id, user.email, user.role);
  }

  async registerLawyer(dto: RegisterLawyerDto) {
    if (!this.validateEnrollmentNumber(dto.enrollmentNo))
      throw new BadRequestException('Invalid Bar Council enrollment number. Use format: 2 letters / 2 digits / 4–8 digits (e.g. BR/20/123456)');
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.LAWYER,
        enrollmentNo: dto.enrollmentNo.toUpperCase(),
        lawyerVerificationStatus: 'PENDING',
        credits: 10,
      },
    });
    return this.tokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return this.tokens(user.id, user.email, user.role);
  }

  validateEnrollmentNumber(enrollmentNo: string): boolean {
    return ENROLLMENT_REGEX.test(enrollmentNo?.trim() || '');
  }

  private async tokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken, expiresIn: this.config.get('JWT_EXPIRES_IN') || '7d' };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedException('Invalid or expired refresh token');
    return this.tokens(stored.userId, stored.user.email, stored.user.role);
  }
}
