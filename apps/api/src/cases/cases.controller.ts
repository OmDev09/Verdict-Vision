import { Controller, Get, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private cases: CasesService) {}

  @Get('suggest')
  async suggest(
    @Query('q') q: string,
    @Query('court') court?: string,
    @Query('year') year?: string,
    @Query('limit') limit?: string,
  ) {
    const numYear = year ? parseInt(year, 10) : undefined;
    const numLimit = limit ? Math.min(20, parseInt(limit, 10)) : 10;
    if (!q?.trim()) return [];
    return this.cases.searchByKeyword(q.trim(), court, numYear, numLimit);
  }
}
