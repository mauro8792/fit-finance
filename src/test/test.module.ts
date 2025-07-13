import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [MercadoPagoModule],
  controllers: [TestController],
})
export class TestModule {}
