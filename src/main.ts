import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

  const logger = new Logger('bootstrap');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remueve la basura que entra
      forbidNonWhitelisted: true, // te avisa que no puede recibir las key que vienen demas
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
