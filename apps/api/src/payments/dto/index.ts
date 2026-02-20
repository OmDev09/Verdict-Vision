import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  planId: string;
}

export class ConfirmPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpayOrderId: string;
}
