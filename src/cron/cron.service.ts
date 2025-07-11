import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student/entities/student.entity';
import { Fee } from '../fee/entities/fee.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger('CronService');

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Fee)
    private readonly feeRepository: Repository<Fee>,
  ) {}

  // Ejecuta todos los días a las 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async generateMonthlyFees() {
    this.logger.log('Iniciando generación automática de cuotas mensuales...');
    
    try {
      // Obtener todos los estudiantes activos
      const activeStudents = await this.studentRepository.find({
        where: { isActive: true },
        relations: ['sport'],
      });

      this.logger.log(`Procesando ${activeStudents.length} estudiantes activos`);

      for (const student of activeStudents) {
        await this.generateNextFeeIfNeeded(student);
      }

      this.logger.log('Generación automática de cuotas completada');
    } catch (error) {
      this.logger.error('Error en la generación automática de cuotas:', error);
    }
  }

  private async generateNextFeeIfNeeded(student: Student) {
    try {
      // Verificar cuántas cuotas futuras tiene el estudiante
      const today = new Date();
      
      const futureFees = await this.feeRepository
        .createQueryBuilder('fee')
        .where('fee.studentId = :studentId', { studentId: student.id })
        .andWhere('fee.startDate > :today', { today })
        .getCount();

      // Si tiene menos de 2 cuotas futuras, generar una nueva
      if (futureFees < 2) {
        // Encontrar la última cuota del estudiante
        const lastFee = await this.feeRepository
          .createQueryBuilder('fee')
          .where('fee.studentId = :studentId', { studentId: student.id })
          .orderBy('fee.endDate', 'DESC')
          .getOne();

        let startDate: Date;
        
        if (lastFee) {
          // La nueva cuota comienza al día siguiente de la última
          startDate = new Date(lastFee.endDate);
          startDate.setDate(startDate.getDate() + 1);
        } else {
          // Si no hay cuotas anteriores, comenzar desde hoy
          startDate = new Date(today);
        }

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);

        const month = startDate.getMonth() + 1;
        const year = startDate.getFullYear();

        // Verificar que no exista ya una cuota para ese mes/año
        const existingFee = await this.feeRepository.findOne({
          where: {
            student: { id: student.id },
            month: month,
            year: year,
          },
        });

        if (!existingFee) {
          const newFee = this.feeRepository.create({
            student: { id: student.id } as Student,
            startDate: startDate,
            endDate: endDate,
            value: student.sport.monthlyFee,
            amountPaid: 0,
            month: month,
            year: year,
          });

          await this.feeRepository.save(newFee);
          
          this.logger.log(
            `Nueva cuota generada para estudiante ${student.firstName} ${student.lastName} (ID: ${student.id}): ${startDate.toDateString()} - ${endDate.toDateString()}`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error generando cuota para estudiante ${student.id}:`, error);
    }
  }

  // Método manual para generar cuotas (útil para testing)
  async generateFeesManually() {
    this.logger.log('Generación manual de cuotas iniciada...');
    await this.generateMonthlyFees();
  }
}
