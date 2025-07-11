import { Controller, Post } from '@nestjs/common';
import { CronService } from './cron.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('generate-fees')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  async generateFeesManually() {
    await this.cronService.generateFeesManually();
    return {
      message: 'Generación manual de cuotas ejecutada exitosamente',
    };
  }
}
