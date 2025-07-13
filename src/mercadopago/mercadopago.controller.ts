import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Req, 
  HttpCode, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MercadoPagoService } from './mercadopago.service';
import { CreatePreferenceDto, ProcessPaymentDto, WebhookDto } from './dto/mercadopago.dto';

@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * Crear preferencia de pago
   * POST /mercadopago/create-preference
   */
  @Post('create-preference')
  @UseGuards(AuthGuard('jwt'))
  async createPreference(@Body() createPreferenceDto: CreatePreferenceDto) {
    this.logger.log(`Creating preference for fee: ${createPreferenceDto.feeId}`);
    return await this.mercadoPagoService.createPreference(createPreferenceDto);
  }

  /**
   * Procesar pago directo
   * POST /mercadopago/process-payment
   */
  @Post('process-payment')
  @UseGuards(AuthGuard('jwt'))
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
    this.logger.log(`Processing payment for fee: ${processPaymentDto.feeId}`);
    return await this.mercadoPagoService.processPayment(processPaymentDto);
  }

  /**
   * Webhook de MercadoPago
   * POST /mercadopago/webhook
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: any, @Req() req: any) {
    this.logger.log(`Webhook received from MercadoPago`);
    
    // Log headers para debugging
    this.logger.debug(`Webhook headers: ${JSON.stringify(req.headers)}`);
    
    return await this.mercadoPagoService.handleWebhook(webhookData);
  }

  /**
   * Obtener métodos de pago disponibles
   * GET /mercadopago/payment-methods
   */
  @Get('payment-methods')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentMethods() {
    this.logger.log('Getting available payment methods');
    return await this.mercadoPagoService.getPaymentMethods();
  }

  /**
   * Obtener public key para el frontend
   * GET /mercadopago/public-key
   */
  @Get('public-key')
  @UseGuards(AuthGuard('jwt'))
  async getPublicKey() {
    return {
      public_key: process.env.MERCADOPAGO_PUBLIC_KEY
    };
  }
}
