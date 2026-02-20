import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, ConfirmPaymentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get('plans')
  getPlans() {
    return this.payments.getPlans();
  }

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.payments.createOrder(user.id, dto.planId);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(@CurrentUser() user: CurrentUserPayload, @Body() dto: ConfirmPaymentDto) {
    const result = await this.payments.confirmPayment(dto.paymentId, dto.razorpayPaymentId, dto.razorpayOrderId);
    if (!result) return { success: false, message: 'Invalid or already processed' };
    return result;
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser() user: CurrentUserPayload) {
    return this.payments.getWalletHistory(user.id);
  }

  @Post('webhook')
  async webhook(@Req() req: Request) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const ok = await this.payments.webhookVerify(rawBody, signature);
    if (!ok) return { status: 'invalid signature' };
    const event = req.body?.event;
    if (event === 'payment.captured' && req.body?.payload?.payment?.entity) {
      const entity = req.body.payload.payment.entity;
      const paymentId = entity.notes?.paymentId ?? entity.receipt;
      if (paymentId) {
        await this.payments.confirmPayment(paymentId, entity.id, entity.order_id);
      }
    }
    return { status: 'ok' };
  }
}
