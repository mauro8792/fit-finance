import { IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';

export class CreatePreferenceDto {
  @IsNumber()
  feeId: number;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsEmail()
  payerEmail: string;

  @IsString()
  payerFirstName: string;

  @IsString()
  payerLastName: string;

  @IsString()
  payerDocument: string;

  @IsOptional()
  @IsString()
  payerPhone?: string;
}

export class ProcessPaymentDto {
  @IsString()
  token: string;

  @IsNumber()
  feeId: number;

  @IsNumber()
  transactionAmount: number;

  @IsString()
  description: string;

  @IsString()
  paymentMethodId: string;

  @IsEmail()
  payerEmail: string;

  @IsString()
  payerDocumentType: string;

  @IsString()
  payerDocumentNumber: string;
}

export class WebhookDto {
  @IsString()
  action: string;

  @IsString()
  api_version: string;

  @IsString()
  data_id: string;

  @IsString()
  date_created: string;

  @IsString()
  id: string;

  @IsString()
  live_mode: string;

  @IsString()
  type: string;

  @IsString()
  user_id: string;
}
