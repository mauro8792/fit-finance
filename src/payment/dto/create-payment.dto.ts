import { IsDateString, IsNumber } from "class-validator";

export class CreatePaymentDto {
  @IsNumber()
  studentId: number;

  @IsDateString()
  paymentDate: Date;

  @IsNumber()
  amountPaid: number;

  @IsNumber()
  feeId: number;
}
