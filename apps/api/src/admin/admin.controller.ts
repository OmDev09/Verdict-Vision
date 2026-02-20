import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateCaseDto } from './dto/create-case.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  @Get('users')
  listUsers(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.admin.listUsers(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Post('lawyers/approve')
  approveLawyer(@Body('userId') userId: string) {
    return this.admin.approveLawyer(userId);
  }

  @Post('lawyers/reject')
  rejectLawyer(@Body('userId') userId: string) {
    return this.admin.rejectLawyer(userId);
  }

  @Post('cases')
  createCase(@Body() dto: CreateCaseDto) {
    return this.admin.createCase(dto);
  }

  @Get('payments')
  listPayments(@Query('limit') limit?: string) {
    return this.admin.listPayments(limit ? parseInt(limit, 10) : 100);
  }
}
