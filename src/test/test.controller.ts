import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * Simular webhook de MercadoPago para testing
   * POST /test/simulate-webhook
   */
  @Post('simulate-webhook')
  async simulateWebhook(@Body() body: any) {
    this.logger.log('Simulating MercadoPago webhook...');
    
    // Simular datos de un pago aprobado
    const mockWebhookData = {
      action: 'payment.updated',
      api_version: 'v1',
      data: {
        id: body.paymentId || '12345678901' // ID del pago de MercadoPago
      },
      date_created: new Date().toISOString(),
      id: Math.floor(Math.random() * 1000000),
      live_mode: false,
      type: 'payment',
      user_id: '440825017'
    };

    this.logger.log(`Mock webhook data: ${JSON.stringify(mockWebhookData, null, 2)}`);

    // Llamar al webhook handler del servicio MercadoPago
    try {
      await this.mercadoPagoService.handleWebhookNotification(mockWebhookData);
      return { 
        message: 'Webhook simulado exitosamente',
        data: mockWebhookData 
      };
    } catch (error) {
      this.logger.error(`Error simulating webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simular un pago específico para una cuota
   * POST /test/simulate-payment
   */
  @Post('simulate-payment')
  async simulatePayment(@Body() body: { feeId: number; amount: number }) {
    this.logger.log(`Simulating payment for fee ${body.feeId} amount ${body.amount}`);
    
    const mockPaymentData = {
      id: Math.floor(Math.random() * 1000000000), // ID del pago
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: body.amount,
      external_reference: body.feeId.toString(),
      payment_method_id: 'account_money',
      payment_type_id: 'account_money',
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      payer: {
        id: '440825017',
        email: 'test_user_290440088@testuser.com'
      }
    };

    // Simular webhook
    const webhookData = {
      action: 'payment.updated',
      api_version: 'v1',
      data: {
        id: mockPaymentData.id.toString()
      },
      date_created: new Date().toISOString(),
      id: Math.floor(Math.random() * 1000000),
      live_mode: false,
      type: 'payment',
      user_id: '440825017'
    };

    try {
      // Primero simular que MercadoPago nos devuelve los datos del pago
      this.logger.log(`Mock payment data: ${JSON.stringify(mockPaymentData, null, 2)}`);
      
      // Luego procesar el webhook
      await this.mercadoPagoService.handleWebhookNotification(webhookData, mockPaymentData);
      
      return { 
        message: 'Pago simulado exitosamente',
        payment: mockPaymentData,
        webhook: webhookData
      };
    } catch (error) {
      this.logger.error(`Error simulating payment: ${error.message}`);
      throw error;
    }
  }
}
