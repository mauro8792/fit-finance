import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // DEBUG: Logs para Render deployment
  console.log('🔍 DEBUG - Current working directory:', process.cwd());
  console.log('🔍 DEBUG - __dirname:', __dirname);
  console.log('🔍 DEBUG - process.argv:', process.argv);
  console.log('🔍 DEBUG - Environment:', process.env.NODE_ENV);
  
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.setGlobalPrefix('api');

  const logger = new Logger('bootstrap');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remueve la basura que entra
      forbidNonWhitelisted: true, // te avisa que no puede recibir las key que vienen demas
      transform: true,
      transformOptions: {
       // enableImplicitConversion: true,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Fit Finances')
    .setDescription('Handle paymants')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT, '0.0.0.0'); // Escuchar en todas las interfaces
  logger.log(`App running on port ${process.env.PORT} on all interfaces`);
}
bootstrap();
