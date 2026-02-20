import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

const PLANS = {
  basic: { name: 'Basic', credits: 50, amount: 299, gstPercent: 18 },
  pro: { name: 'Pro', credits: 200, amount: 999, gstPercent: 18 },
  lawyer_premium: { name: 'Lawyer Premium', credits: 500, amount: 2499, gstPercent: 18 },
} as const;

export type PlanId = keyof typeof PLANS;

@Injectable()
export class PaymentsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  getPlans() {
    return Object.entries(PLANS).map(([id, p]) => ({
      id,
      name: p.name,
      credits: p.credits,
      amount: p.amount,
      amountInPaise: p.amount * 100,
      gstPercent: p.gstPercent,
    }));
  }

  async createOrder(userId: string, planId: string) {
    const plan = PLANS[planId as PlanId];
    if (!plan) throw new Error('Invalid plan');
    const amount = plan.amount;
    const gstAmount = Math.round((amount * plan.gstPercent) / 100);
    const totalAmount = amount + gstAmount;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: totalAmount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        plan: planId,
        gstAmount,
      },
    });

    const keyId = this.config.get('RAZORPAY_KEY_ID');
    const keySecret = this.config.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      return {
        orderId: payment.id,
        amount: totalAmount * 100,
        currency: 'INR',
        planId,
        credits: plan.credits,
        razorpayOrderId: null,
        message: 'Razorpay not configured. Use orderId for testing.',
      };
    }

    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: payment.id,
      notes: { planId, credits: String(plan.credits) },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayId: order.id },
    });

    return {
      orderId: payment.id,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      credits: plan.credits,
      keyId,
    };
  }

  async confirmPayment(paymentId: string, razorpayPaymentId: string, razorpayOrderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, gatewayId: razorpayOrderId, status: PaymentStatus.PENDING },
      include: { user: true },
    });
    if (!payment) return null;
    const plan = PLANS[payment.plan as PlanId];
    if (!plan) return null;

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS, gatewayId: razorpayPaymentId, creditsAdded: plan.credits },
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: { credits: { increment: plan.credits } },
      }),
    ]);
    return { success: true, creditsAdded: plan.credits };
  }

  async webhookVerify(body: string, signature: string) {
    const crypto = require('crypto');
    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expected === signature;
  }

  async getWalletHistory(userId: string, limit = 50) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, amount: true, status: true, creditsAdded: true, plan: true, createdAt: true },
    });
  }
}
