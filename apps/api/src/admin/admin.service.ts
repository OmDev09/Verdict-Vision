import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LawyerVerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, lawyers, cases, searches, payments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'LAWYER' } }),
      this.prisma.case.count(),
      this.prisma.search.count(),
      this.prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    ]);
    return {
      users,
      lawyers,
      cases,
      searches,
      revenue: payments._sum.amount ?? 0,
    };
  }

  async listUsers(limit = 50, offset = 0) {
    return this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, credits: true, enrollmentNo: true, lawyerVerificationStatus: true, createdAt: true },
    });
  }

  async approveLawyer(userId: string) {
    return this.prisma.user.update({
      where: { id: userId, role: 'LAWYER' },
      data: { lawyerVerificationStatus: LawyerVerificationStatus.APPROVED },
    });
  }

  async rejectLawyer(userId: string) {
    return this.prisma.user.update({
      where: { id: userId, role: 'LAWYER' },
      data: { lawyerVerificationStatus: LawyerVerificationStatus.REJECTED },
    });
  }

  async createCase(data: {
    title: string;
    parties?: string;
    court: string;
    year: number;
    citation?: string;
    judgmentText: string;
    pdfUrl?: string;
    bench?: string;
    actsSections?: string;
    sourceUrl?: string;
  }) {
    return this.prisma.case.create({ data });
  }

  async listPayments(limit = 100) {
    return this.prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }
}
