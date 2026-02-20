import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStatus() {
    const provider = (this.ai as any).provider ?? 'none';
    const hasOllama = !!(this.ai as any).ollamaBaseUrl;
    const hasGroq = !!(this.ai as any).groqKey;
    return {
      provider,
      configured: { ollama: hasOllama, groq: hasGroq },
      message: `Current provider: ${provider}. Set OLLAMA_BASE_URL (local) or GROQ_API_KEY in apps/api/.env`,
    };
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async test(@Body('query') query?: string) {
    const testQuery = query || 'What is the meaning of life?';
    try {
      const response = await (this.ai as any).generateResponse(
        testQuery,
        [],
        false,
      );
      return {
        success: true,
        provider: (this.ai as any).provider,
        query: testQuery,
        response: response.slice(0, 200) + '...',
        fullResponse: response,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('[AI Test Error]', errorMessage, errorStack);
      return {
        success: false,
        provider: (this.ai as any).provider,
        error: errorMessage,
        stack: errorStack,
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : undefined,
      };
    }
  }
}
