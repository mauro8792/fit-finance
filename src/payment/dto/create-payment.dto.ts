import { IsDateString, IsNumber, IsString, Matches } from "class-validator";

export class CreatePaymentDto {
  @IsNumber()
  studentId: number;

  @IsDateString()
  paymentDate: Date;

  @IsNumber()
  amountPaid: number;

  @IsNumber()
  feeId: number;

  @IsString()
  paymentMethod: string;
}
