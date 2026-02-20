import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async executeSearch(user: CurrentUserPayload, dto: SearchQueryDto) {
    if (user.credits < 1) throw new BadRequestException('Insufficient credits. Please add credits to continue.');
    const creditsToUse = 1;

    const search = await this.prisma.search.create({
      data: {
        userId: user.id,
        query: dto.query,
        creditsUsed: creditsToUse,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditsToUse } },
    });

    try {
      const isLawyer = user.role === 'LAWYER';
      const similarCases = await this.ai.retrieveSimilarCases(dto.query, dto.court, dto.year, 10);
      const aiResponse = await this.ai.generateResponse(dto.query, similarCases, isLawyer);

      await this.prisma.search.update({
        where: { id: search.id },
        data: { aiResponse },
      });

      for (const c of similarCases) {
        await this.prisma.caseSearchResult.create({
          data: { searchId: search.id, caseId: c.id, score: c.score ?? 0 },
        });
      }

      return {
        searchId: search.id,
        query: dto.query,
        creditsUsed: creditsToUse,
        creditsRemaining: user.credits - creditsToUse,
        response: aiResponse,
        similarCases: similarCases.map((c) => ({
          id: c.id,
          title: c.title,
          court: c.court,
          year: c.year,
          citation: c.citation,
          pdfUrl: c.pdfUrl,
        })),
      };
    } catch (error) {
      console.error('Search error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `AI service error: ${message}. Check your API key and provider configuration.`,
      );
    }
  }

  async getSearchHistory(userId: string, limit = 20) {
    return this.prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, query: true, creditsUsed: true, createdAt: true },
    });
  }
}
