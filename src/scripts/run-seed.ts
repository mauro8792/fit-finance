import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../seed/seed.service';

async function runSeed() {
  try {
    console.log('🌱 Iniciando seed...');
    
    const app = await NestFactory.create(AppModule);
    
    const seedService = app.get(SeedService);
    
    await seedService.runSeed();
    
    console.log('✅ Seed ejecutado exitosamente!');
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    process.exit(1);
  }
}

runSeed();
