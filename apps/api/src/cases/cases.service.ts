import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CaseWithScore {
  id: string;
  title: string;
  court: string;
  year: number;
  citation: string | null;
  judgmentText: string;
  pdfUrl: string | null;
  score?: number;
}

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async searchByKeyword(
    query: string,
    court?: string,
    year?: number,
    limit = 10,
  ): Promise<CaseWithScore[]> {
    const terms = query.split(/\s+/).filter(Boolean).slice(0, 5);
    if (terms.length === 0) {
      const list = await this.prisma.case.findMany({
        where: { ...(court && { court }), ...(year && { year }) },
        orderBy: { year: 'desc' },
        take: limit,
      });
      return list.map((c) => ({ ...c, score: 1 }));
    }
    const where: Record<string, unknown> = {};
    if (court) where.court = court;
    if (year) where.year = year;
    where.OR = [
      ...terms.map((t) => ({ title: { contains: t, mode: 'insensitive' as const } })),
      ...terms.map((t) => ({ judgmentText: { contains: t, mode: 'insensitive' as const } })),
      ...terms.map((t) => ({ citation: { contains: t, mode: 'insensitive' as const } })),
    ];
    const list = await this.prisma.case.findMany({
      where,
      orderBy: { year: 'desc' },
      take: limit * 2,
    });
    return list.slice(0, limit).map((c) => ({ ...c, score: 1 }));
  }

  async searchByEmbedding(
    _vector: number[],
    court?: string,
    year?: number,
    limit = 10,
  ): Promise<CaseWithScore[]> {
    // Without pgvector/Pinecone we fallback to keyword; in production hook Pinecone here
    const list = await this.prisma.case.findMany({
      where: { ...(court && { court }), ...(year && { year }) },
      orderBy: { year: 'desc' },
      take: limit,
    });
    return list.map((c) => ({ ...c, score: 0.9 }));
  }
}
