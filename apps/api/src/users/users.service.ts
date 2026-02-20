import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, credits: true, enrollmentNo: true, lawyerVerificationStatus: true, createdAt: true },
    });
  }

  async deductCredits(userId: string, amount: number) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    });
    return u.credits;
  }

  async addCredits(userId: string, amount: number) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
    return u.credits;
  }
}
