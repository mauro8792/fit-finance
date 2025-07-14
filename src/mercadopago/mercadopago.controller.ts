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

  /**
   * Simular pago exitoso (SOLO PARA DESARROLLO)
   * POST /mercadopago/simulate-payment
   */
  @Post('simulate-payment')
  async simulatePayment(@Body() data: { preferenceId: string, feeId: string }) {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Endpoint no disponible en producción' };
    }
    
    this.logger.log(`Simulating successful payment for fee: ${data.feeId}`);
    
    // Simular datos de webhook de MercadoPago
    const mockWebhookData = {
      type: 'payment',
      data: { id: 'MOCK_' + Date.now() }
    };
    
    const mockPaymentData = {
      id: 'MOCK_' + Date.now(),
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 8500,
      payment_method_id: 'bank_transfer',
      payment_type_id: 'bank_transfer',
      external_reference: data.feeId
    };
    
    return await this.mercadoPagoService.handleWebhookNotification(mockWebhookData, mockPaymentData);
  }

  /**
   * Simular webhook de pago (SOLO PARA TESTING)
   * POST /mercadopago/simulate-webhook
   */
  @Post('simulate-webhook')
  async simulateWebhook(@Body() data: { feeId: string, status?: string }) {
    this.logger.log(`Simulating webhook for fee: ${data.feeId}`);
    
    // Simular datos de webhook real de MercadoPago
    const mockWebhookData = {
      action: 'payment.updated',
      api_version: 'v1',
      data: { 
        id: 'WEBHOOK_' + Date.now() 
      },
      date_created: new Date().toISOString(),
      id: Math.floor(Math.random() * 1000000),
      live_mode: false,
      type: 'payment',
      user_id: 440825017
    };
    
    const mockPaymentData = {
      id: 'WEBHOOK_' + Date.now(),
      status: data.status || 'approved',
      status_detail: 'accredited',
      transaction_amount: 8500,
      payment_method_id: 'bank_transfer',
      payment_type_id: 'bank_transfer',
      external_reference: data.feeId,
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      payer: {
        id: '123456',
        email: 'test@mercadopago.com'
      }
    };
    
    const result = await this.mercadoPagoService.handleWebhookNotification(mockWebhookData, mockPaymentData);
    
    return {
      message: 'Webhook simulado exitosamente',
      webhook_data: mockWebhookData,
      payment_data: mockPaymentData,
      result: result
    };
  }

  /**
   * Simular flujo completo de pago exitoso
   * POST /mercadopago/test-complete-flow
   */
  @Post('test-complete-flow')
  async testCompleteFlow(@Body() data: { feeId: string }) {
    this.logger.log(`Testing complete payment flow for fee: ${data.feeId}`);
    
    try {
      // 1. Simular el webhook
      const webhookResult = await this.simulateWebhook(data);
      
      // 2. Construir URL de redirección con parámetros
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const successUrl = `${frontendUrl}/student/payment-success?` + 
        `collection_id=MOCK_${Date.now()}&` +
        `collection_status=approved&` +
        `payment_id=MOCK_${Date.now()}&` +
        `status=approved&` +
        `external_reference=${data.feeId}&` +
        `payment_type=bank_transfer&` +
        `merchant_order_id=MOCK_ORDER_${Date.now()}&` +
        `preference_id=MOCK_PREF_${Date.now()}`;
      
      return {
        message: 'Flujo completo simulado exitosamente',
        redirect_url: successUrl,
        webhook_result: webhookResult,
        instructions: 'Copia la redirect_url en tu navegador para ver la página de éxito'
      };
      
    } catch (error) {
      this.logger.error(`Error in complete flow test: ${error.message}`);
      throw error;
    }
  }

  /**
   * Endpoint de prueba simple
   * GET /mercadopago/test
   */
  @Get('test')
  getTest() {
    return { message: 'MercadoPago module is working!' };
  }
}
