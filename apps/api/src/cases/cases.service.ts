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
  constructor(private prisma: PrismaService) { }

  async searchByKeyword(
    query: string,
    court?: string,
    year?: number,
    limit = 10,
  ): Promise<CaseWithScore[]> {
    const terms = query.split(/\s+/).filter(Boolean).map(t => t.trim()).slice(0, 10);
    if (terms.length === 0) {
      const list = await this.prisma.case.findMany({
        where: { ...(court && { court }), ...(year && { year }) },
        orderBy: { year: 'desc' },
        take: limit,
      });
      return list.map((c) => ({ ...c, score: 1 }));
    }

    // We use Postgres Full-Text Search (BM25 lexical retrieval)
    // We search across title, citation, and judgment_text
    const tsQuery = terms.join(' | ');

    try {
      const { Prisma } = require('@prisma/client');
      // Build conditions dynamically for court/year to avoid SQL injection on parameters
      const courtCondition = court ? Prisma.sql`AND court = ${court}` : Prisma.empty;
      const yearCondition = year ? Prisma.sql`AND year = ${year}` : Prisma.empty;

      const tsQueryParam = terms.join(' & ');

      const results = await this.prisma.$queryRaw<any[]>`
        SELECT id, title, court, year, citation, "pdf_url" as "pdfUrl", "judgment_text" as "judgmentText",
        ts_rank_cd(
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(citation, '')), 'A') ||
          setweight(to_tsvector('english', coalesce("judgment_text", '')), 'B'),
          to_tsquery('english', ${tsQueryParam})
        ) as score
        FROM cases
        WHERE (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(citation, '')), 'A') ||
          setweight(to_tsvector('english', coalesce("judgment_text", '')), 'B')
        ) @@ to_tsquery('english', ${tsQueryParam})
        ${courtCondition}
        ${yearCondition}
        ORDER BY score DESC, year DESC
        LIMIT ${limit * 2};
      `;

      // Map back to our expected interface
      return results.slice(0, limit).map(r => ({
        id: r.id,
        title: r.title,
        court: r.court,
        year: r.year,
        citation: r.citation,
        judgmentText: r.judgmentText,
        pdfUrl: r.pdfUrl,
        score: typeof r.score === 'number' ? r.score : parseFloat(r.score) || 0,
      }));
    } catch (error) {
      console.error('Postgres FTS Error, falling back to basic search:', error);
      // Fallback if tsvector syntax has issues (e.g. weird characters in tsQuery)
      const list = await this.prisma.case.findMany({
        where: {
          ...(court && { court }),
          ...(year && { year }),
          judgmentText: { contains: terms[0], mode: 'insensitive' }
        },
        orderBy: { year: 'desc' },
        take: limit,
      });
      return list.map((c) => ({ ...c, score: 0.5 }));
    }
  }

  async rerankResults(
    query: string,
    documents: CaseWithScore[],
    topK = 5,
  ): Promise<CaseWithScore[]> {
    // In a production Vectorless RAG system, this is where we call a Cross-Encoder
    // (e.g. BGE-Reranker-Large, Cohere Rerank, FlashRank).
    // The Reranker takes the pairs (query, doc_text) and outputs a precise float [0, 1].

    console.log(`[Reranker Stub] Reranking top ${documents.length} lexical results...`);

    // For now, we simulate a reranker by slightly adjusting the BM25 scores 
    // based on exact phrase matches in the title or text
    const reranked = documents.map(doc => {
      let boost = 0;
      const lowerQuery = query.toLowerCase();
      if (doc.title.toLowerCase().includes(lowerQuery)) boost += 0.5;
      if (doc.judgmentText.toLowerCase().includes(lowerQuery)) boost += 0.2;

      return {
        ...doc,
        // Normalized simulated reranker score
        score: Math.min(1.0, (doc.score || 0.5) * 0.1 + boost)
      };
    });

    // Sort by the new reranked score and take the top K for the LLM context
    return reranked.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, topK);
  }
}
