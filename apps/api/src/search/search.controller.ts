import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  search(@CurrentUser() user: CurrentUserPayload, @Body() dto: SearchQueryDto) {
    return this.searchService.executeSearch(user, dto);
  }

  @Get('history')
  history(@CurrentUser() user: CurrentUserPayload, @Query('limit') limit?: number) {
    return this.searchService.getSearchHistory(user.id, limit ? Number(limit) : 20);
  }
}
