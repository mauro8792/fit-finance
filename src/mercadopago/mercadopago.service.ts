import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { CreatePreferenceDto, ProcessPaymentDto } from './dto/mercadopago.dto';
import { PaymentService } from '../payment/payment.service';
import { FeeService } from '../fee/fee.service';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  private readonly payment: Payment;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly feeService: FeeService,
  ) {
    // Inicializar MercadoPago
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.get('MERCADOPAGO_ACCESS_TOKEN'),
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);

    this.logger.log('MercadoPago Service initialized');
  }

  /**
   * Crear preferencia de pago (para redirección)
   */
  async createPreference(createPreferenceDto: CreatePreferenceDto) {
    try {
      this.logger.log(`Creating preference for fee: ${createPreferenceDto.feeId}`);
      this.logger.log(`Frontend URL: ${this.configService.get('FRONTEND_URL')}`);
      this.logger.log(`Backend URL: ${this.configService.get('BACKEND_URL')}`);

      // Verificar que la cuota existe y está pendiente
      const fee = await this.feeService.findOne(createPreferenceDto.feeId.toString());
      if (!fee) {
        throw new BadRequestException('Cuota no encontrada');
      }

      const preferenceData = {
        items: [
          {
            id: createPreferenceDto.feeId,
            title: createPreferenceDto.description,
            category_id: 'sports',
            quantity: 1,
            currency_id: 'ARS', // Peso argentino
            unit_price: Number(createPreferenceDto.amount),
          }
        ],
        payer: {
          name: createPreferenceDto.payerFirstName,
          surname: createPreferenceDto.payerLastName,
          email: createPreferenceDto.payerEmail,
          phone: {
            area_code: '11',
            number: createPreferenceDto.payerPhone || '1234567890'
          },
          identification: {
            type: 'DNI',
            number: createPreferenceDto.payerDocument
          },
          address: {
            street_name: 'Gym Address',
            street_number: 123,
            zip_code: '1234'
          }
        },
        back_urls: {
          success: `${this.configService.get('FRONTEND_URL')}/student/payment-success`,
          failure: `${this.configService.get('FRONTEND_URL')}/student/payment-failure`,
          pending: `${this.configService.get('FRONTEND_URL')}/student/payment-pending`
        },
        payment_methods: this.getPaymentMethodsConfig(createPreferenceDto.preferredPaymentMethod),
        notification_url: `${this.configService.get('BACKEND_URL')}/mercadopago/webhook`,
        statement_descriptor: 'GYM_FIT_FINANCE',
        external_reference: createPreferenceDto.feeId.toString(),
        // Agregar metadata para transferencias bancarias
        ...(createPreferenceDto.bankTransferData && {
          metadata: {
            bank_transfer_data: createPreferenceDto.bankTransferData
          }
        })
      };

      this.logger.log(`Preference data: ${JSON.stringify(preferenceData, null, 2)}`);

      const preference = await this.preference.create({
        body: preferenceData as any
      });
      
      this.logger.log(`Preference created successfully: ${preference.id}`);
      
      return {
        id: preference.id,
        sandbox_init_point: preference.sandbox_init_point,
        init_point: preference.init_point,
      };

    } catch (error) {
      this.logger.error(`Error creating preference: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la preferencia de pago');
    }
  }

  /**
   * Procesar pago directo (con token de tarjeta)
   */
  async processPayment(processPaymentDto: ProcessPaymentDto) {
    try {
      this.logger.log(`Processing payment for fee: ${processPaymentDto.feeId}`);

      // Verificar que la cuota existe
      const fee = await this.feeService.findOne(processPaymentDto.feeId.toString());
      if (!fee) {
        throw new BadRequestException('Cuota no encontrada');
      }

      const paymentData = {
        transaction_amount: Number(processPaymentDto.transactionAmount),
        token: processPaymentDto.token,
        description: processPaymentDto.description,
        installments: 1,
        payment_method_id: processPaymentDto.paymentMethodId,
        issuer_id: null,
        payer: {
          email: processPaymentDto.payerEmail,
          identification: {
            type: processPaymentDto.payerDocumentType,
            number: processPaymentDto.payerDocumentNumber
          }
        },
        external_reference: processPaymentDto.feeId.toString(),
        statement_descriptor: 'GYM_FIT_FINANCE',
      };

      const payment = await this.payment.create({
        body: paymentData as any
      });

      this.logger.log(`Payment processed: ${payment.id} - Status: ${payment.status}`);

      // Actualizar el pago en nuestra base de datos
      await this.updatePaymentInDatabase(payment, processPaymentDto.feeId.toString());

      return {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        payment_method_id: payment.payment_method_id,
        transaction_amount: payment.transaction_amount,
      };

    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`, error.stack);
      throw new BadRequestException('Error al procesar el pago');
    }
  }

  /**
   * Manejar webhook de MercadoPago
   */
  async handleWebhook(data: any) {
    try {
      this.logger.log(`Webhook received: ${JSON.stringify(data)}`);

      if (data.type === 'payment') {
        const paymentId = data.data.id;
        const payment = await this.payment.get({ id: paymentId });

        this.logger.log(`Payment webhook - ID: ${payment.id}, Status: ${payment.status}`);

        // Actualizar el estado del pago en nuestra base de datos
        if (payment.external_reference) {
          await this.updatePaymentInDatabase(payment, payment.external_reference);
        }

        return { message: 'Webhook processed successfully' };
      }

      return { message: 'Webhook type not handled' };

    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
      throw new BadRequestException('Error al procesar webhook');
    }
  }

  /**
   * Manejar notificación de webhook (para testing)
   */
  async handleWebhookNotification(webhookData: any, mockPaymentData?: any) {
    try {
      this.logger.log(`Webhook notification received: ${JSON.stringify(webhookData)}`);

      if (webhookData.type === 'payment') {
        let payment;
        
        if (mockPaymentData) {
          // Usar datos mock para testing
          payment = mockPaymentData;
          this.logger.log('Using mock payment data for testing');
        } else {
          // Obtener datos reales de MercadoPago
          const paymentId = webhookData.data.id;
          payment = await this.payment.get({ id: paymentId });
        }

        this.logger.log(`Payment webhook - ID: ${payment.id}, Status: ${payment.status}, External Ref: ${payment.external_reference}`);

        // Actualizar el estado del pago en nuestra base de datos
        if (payment.external_reference) {
          await this.updatePaymentInDatabase(payment, payment.external_reference);
        }

        return { message: 'Webhook notification processed successfully', payment };
      }

      return { message: 'Webhook type not handled' };

    } catch (error) {
      this.logger.error(`Error handling webhook notification: ${error.message}`, error.stack);
      throw new BadRequestException('Error al procesar notificación de webhook');
    }
  }

  /**
   * Actualizar pago en nuestra base de datos
   */
  private async updatePaymentInDatabase(mpPayment: any, feeId: string) {
    try {
      const paymentData = {
        feeId: feeId,
        amount: mpPayment.transaction_amount,
        method: 'mercadopago',
        status: this.mapMercadoPagoStatus(mpPayment.status),
        externalId: mpPayment.id.toString(),
        metadata: {
          mp_status: mpPayment.status,
          mp_status_detail: mpPayment.status_detail,
          mp_payment_method: mpPayment.payment_method_id,
          mp_payment_type: mpPayment.payment_type_id,
        }
      };

      // Crear o actualizar el pago
      await this.paymentService.createOrUpdatePayment(paymentData);
      
      this.logger.log(`Payment updated in database for fee: ${feeId}`);

    } catch (error) {
      this.logger.error(`Error updating payment in database: ${error.message}`, error.stack);
    }
  }

  /**
   * Mapear estados de MercadoPago a nuestros estados
   */
  private mapMercadoPagoStatus(mpStatus: string): string {
    const statusMap = {
      'approved': 'completed',
      'pending': 'pending',
      'in_process': 'pending',
      'rejected': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded',
    };

    return statusMap[mpStatus] || 'pending';
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getPaymentMethods() {
    try {
      // Esto retorna los métodos de pago disponibles para Argentina
      return {
        credit_cards: ['visa', 'master', 'amex'],
        debit_cards: ['debvisa', 'debmaster'],
        cash: ['rapipago', 'pagofacil'],
        bank_transfer: ['pse']
      };
    } catch (error) {
      this.logger.error(`Error getting payment methods: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener métodos de pago');
    }
  }

  /**
   * Configurar métodos de pago según la preferencia del usuario
   */
  private getPaymentMethodsConfig(preferredMethod?: string) {
    // Configuración para SOLO permitir transferencias bancarias
    const baseConfig = {
      excluded_payment_methods: [],
      excluded_payment_types: [
        { id: 'credit_card' },     // ❌ Sin tarjetas de crédito
        { id: 'debit_card' },      // ❌ Sin tarjetas de débito  
        { id: 'prepaid_card' },    // ❌ Sin tarjetas prepagas
        { id: 'ticket' },          // ❌ Sin tickets de pago
        { id: 'atm' },             // ❌ Sin cajeros automáticos
        { id: 'account_money' }    // ❌ Sin dinero en cuenta MP
      ],
      installments: 1 // Solo pagos únicos para transferencias
    };

    // Solo permitir transferencias bancarias
    return baseConfig;
  }
}
