import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(ValidRoles.superUser)
  executeSeed() {
    return this.seedService.runSeed();
  }

  // ⚠️ ENDPOINT TEMPORAL PARA PRODUCCIÓN - REMOVER DESPUÉS DEL DEPLOY
  @Get('run-production')
  async executeProductionSeed() {
    // Solo permitir en producción y una sola vez
    if (process.env.NODE_ENV !== 'production') {
      return { error: 'Este endpoint solo funciona en producción' };
    }

    try {
      const result = await this.seedService.runSeed();
      return {
        message: 'Seed ejecutado exitosamente en producción',
        result,
      };
    } catch (error) {
      return {
        error: 'Error ejecutando seed',
        details: error.message,
      };
    }
  }
}

