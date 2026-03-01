import { Injectable } from '@nestjs/common';
import { CasesService } from '../cases/cases.service';
import type { CaseWithScore } from '../cases/cases.service';

const DISCLAIMER =
  'Verdict Vision provides AI-generated legal information and does not replace professional legal advice.';

type Provider = 'ollama' | 'groq';

@Injectable()
export class AiService {
  private provider: Provider | null = null;
  private ollamaBaseUrl: string | null = null;
  private groqKey: string | null = null;
  private groqModel: string = 'llama-3.3-70b-versatile';

  constructor(private cases: CasesService) {
    // Priority: Ollama (local, for RAG later) -> Groq (cloud, fast)
    if (process.env.OLLAMA_BASE_URL) {
      this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL.replace(/\/$/, '');
      this.provider = 'ollama';
    } else if (process.env.GROQ_API_KEY) {
      this.groqKey = process.env.GROQ_API_KEY;
      this.groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      this.provider = 'groq';
    }
  }

  private get ollamaModel(): string {
    return process.env.OLLAMA_CHAT_MODEL || 'llama3.2';
  }

  private get ollamaEmbedModel(): string {
    return process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  }

  async retrieveSimilarCases(
    query: string,
    court?: string,
    year?: number,
    topK = 5,
  ): Promise<CaseWithScore[]> {
    console.log(`[Vectorless RAG] 1. Fetching Lexical Matches for: "${query}"`);
    // 1. Lexical Base Retrieval: Get a larger candidate pool (e.g., top 50) using Postgres BM25
    const candidateCases = await this.cases.searchByKeyword(query, court, year, 50);

    if (candidateCases.length === 0) {
      console.log(`[Vectorless RAG] No keyword matches found.`);
      return [];
    }

    console.log(`[Vectorless RAG] 2. Surfaced ${candidateCases.length} candidates. Applying Neural Reranking...`);
    // 2. Neural Reranking: Surface the top K semantically relevant cases from the candidates
    const finalTopCases = await this.cases.rerankResults(query, candidateCases, topK);

    console.log(`[Vectorless RAG] 3. Reranking complete. Selected top ${finalTopCases.length} cases.`);
    return finalTopCases;
  }



  async generateResponse(
    query: string,
    similarCases: Array<{ title: string; court: string; year: number; citation: string | null; judgmentText: string; pdfUrl?: string | null }>,
    isLawyer: boolean,
  ): Promise<string> {
    const caseContext = similarCases
      .slice(0, 5)
      .map(
        (c) =>
          `[${c.citation || c.title}] ${c.court} ${c.year}\n${c.judgmentText.slice(0, 2000)}...`,
      )
      .join('\n\n---\n\n');

    const hasCases = Boolean(caseContext && caseContext.trim().length > 0);
    const systemPrompt = isLawyer
      ? `You are a legal research assistant for Indian lawyers. Give a direct, final answer only. Do not show reasoning steps or chain-of-thought.

Rules:
- Cite ONLY cases that appear in the "Relevant Case Excerpts" below. If no excerpts are provided, write "No similar cases were found in the database" and base your answer on general Indian law and well-known statutory provisions only.
- Do NOT invent or fabricate case names, citations, or SCC references. If you are unsure of a case, do not cite it.
- Use real Indian Acts only (e.g. Indian Contract Act 1872, specific state Rent Control Acts, CPC, CrPC, Consumer Protection Act). Name the Act and section clearly.
- Write in a formal, court-ready tone. Be concise.

Structure your response exactly as follows:

**Legal Analysis**
Brief analysis of the issue.

**Relevant Case Law**
Only list cases from the excerpts provided, with citation and one-line holding. If no excerpts provided, state "No similar cases found" and skip made-up citations.

**Statutory Provisions**
Relevant Acts and sections (real ones only).

**Legal Arguments**
Key arguments for and against; defenses.

**Recommendations**
Strategy and risk assessment.

End with: ${DISCLAIMER}`
      : `You are a friendly legal information assistant for Indian citizens. Give a direct, final answer only. Do not show reasoning steps or chain-of-thought.

Rules:
- Refer to similar cases ONLY if they appear in the "Relevant Case Excerpts" below. If no excerpts are provided, say "No similar cases were found" and give general guidance based on Indian law. Do NOT invent case names or citations (e.g. do not make up "M. S. v. S. R." or fake SCC citations).
- Use only real Indian laws (e.g. Indian Contract Act 1872, state Rent Control Acts, Consumer Protection Act). Name the law and section in simple terms.
- Be clear, empathetic, and practical. Use everyday language; Hindi-English mix is fine.

Structure your response exactly as follows:

**Understanding Your Situation**
Explain the legal issue in simple terms.

**What Similar Cases Show**
Summarise only cases from the excerpts below, or state "No similar cases found" and general principles.

**Your Options**
What the user can do; pros and cons; risks.

**Next Steps**
Immediate actions; documents; when to see a lawyer.

**Relevant Laws**
Real Acts and sections in simple terms.

End with: ${DISCLAIMER}`;

    const userPrompt = hasCases
      ? `**User Query:** ${query}

**Relevant Case Excerpts (cite only these if you refer to cases):**
${caseContext}

Provide a structured response using the format in your instructions. Use only the cases and facts from the excerpts above; do not invent citations.`
      : `**User Query:** ${query}

**Relevant Case Excerpts:** None. No similar cases found in the database.

Provide general legal guidance for Indian law on the above query. Do not invent or fabricate any case names or citations. Use only well-known Indian statutes and general principles.`;

    if (this.provider === 'ollama' && this.ollamaBaseUrl) {
      const text = await this.chatOllama(systemPrompt, userPrompt);
      return text.includes(DISCLAIMER) ? text : `${text}\n\n${DISCLAIMER}`;
    }

    if (this.provider === 'groq' && this.groqKey) {
      const text = await this.chatGroq(systemPrompt, userPrompt);
      return text.includes(DISCLAIMER) ? text : `${text}\n\n${DISCLAIMER}`;
    }

    return `[No AI provider configured. Set OLLAMA_BASE_URL (local) or GROQ_API_KEY in apps/api/.env.]\n\n${DISCLAIMER}`;
  }

  private async chatOllama(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content ?? '';
  }

  private async chatGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.groqKey) throw new Error('Groq API key not set in GROQ_API_KEY');
    console.log(`[Groq] Using model: ${this.groqModel}`);
    try {
      const requestBody = {
        model: this.groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        // Reasoning/safeguard models need more tokens for reasoning + final answer
        max_tokens: 8192,
        temperature: 0.4,
      };
      console.log(`[Groq] Request to: https://api.groq.com/openai/v1/chat/completions`);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `Groq API error (${res.status})`;
        let errorDetails = '';
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.message || errText;
          errorDetails = errJson.error?.code ? ` Code: ${errJson.error.code}` : '';
          console.error('[Groq] Error:', JSON.stringify(errJson, null, 2));
        } catch {
          errMsg = errText || `HTTP ${res.status}`;
          console.error('[Groq] Error (raw):', errText);
        }
        throw new Error(`Groq: ${errMsg}${errorDetails}. Model: ${this.groqModel}. Check your GROQ_API_KEY and GROQ_MODEL in .env`);
      }

      let data: {
        choices?: Array<{
          message?: {
            content?: string | null;
            /** Used by reasoning/safeguard models when final answer is in reasoning or content is empty */
            reasoning?: string | null;
          }
        }>
      };
      try {
        const responseText = await res.text();
        console.log(`[Groq] Response status: ${res.status}, Content-Type: ${res.headers.get('content-type')}`);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Groq] JSON parse error:', parseError);
        throw new Error(`Groq returned invalid JSON response. Check API status and model availability.`);
      }

      const msg = data.choices?.[0]?.message;
      const content = msg?.content?.trim();
      const reasoning = msg?.reasoning?.trim();

      // Reasoning/safeguard models (e.g. openai/gpt-oss-safeguard-20b) may put output in reasoning when content is empty
      const text = (content && content.length > 0) ? content : (reasoning && reasoning.length > 0 ? reasoning : '');

      if (!text) {
        console.error('[Groq] Empty content and reasoning');
        throw new Error(`Groq returned empty response. Model: ${this.groqModel}. Check model name and API key.`);
      }

      console.log(`[Groq] Success, response length: ${text.length}, source: ${content ? 'content' : 'reasoning'}`);
      return text;
    } catch (error) {
      console.error('[Groq] Full error:', error);
      if (error instanceof Error && error.message.includes('Groq')) throw error;
      throw new Error(`Groq request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
