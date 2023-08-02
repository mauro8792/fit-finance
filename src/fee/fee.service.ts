import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Fee } from './entities/fee.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/student/entities/student.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class FeeService {
  private readonly logger = new Logger('FeeService');

  constructor(
    @InjectRepository(Fee)
    private readonly feeRepository: Repository<Fee>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  create(createFeeDto: CreateFeeDto) {
    return 'This action adds a new fee';
  }

  async findAll(paginationDto: PaginationDto) {
     const { limit = 10, offset = 0, year, month } = paginationDto;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Los meses van de 0 a 11, por lo que sumamos 1 para obtener el mes actual
    const currentYear = currentDate.getFullYear();

    // Consulta todas las cuotas que pertenezcan al mes y año actual
    const feesOfCurrentMonth = await this.feeRepository.find({
      where: {
        month: month,
        year: year,
      },
    });

    return feesOfCurrentMonth;
  }

  async findOne(term: string) {
    this.logger.log(`Get fee by ${term}`);

    const fee = await this.feeRepository.findOneBy({ id: +term });

    if (!fee) throw new NotFoundException(`Fee not found with id: ${term}`);

    return { fee };
  }

  update(id: number, updateFeeDto: UpdateFeeDto) {
    return `This action updates a #${id} fee`;
  }

  remove(id: number) {
    return `This action removes a #${id} fee`;
  }

  async generateNextThreeMonthsFees(): Promise<void> {
    // Obtener todos los estudiantes
    const students = await this.studentRepository.find();

    // Obtener la fecha del próximo mes y los dos siguientes
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextTwoMonths = new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      1,
    );
    const nextThreeMonths = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      1,
    );

    // Generar las cuotas para los próximos tres meses para cada estudiante
    for (const student of students) {
      const existingFees = await this.feeRepository.find({
        where: [
          {
            student,
            month: nextMonth.getMonth() + 1,
            year: nextMonth.getFullYear(),
          },
          {
            student,
            month: nextTwoMonths.getMonth() + 1,
            year: nextTwoMonths.getFullYear(),
          },
          {
            student,
            month: nextThreeMonths.getMonth() + 1,
            year: nextThreeMonths.getFullYear(),
          },
        ],
      });

      const monthsToGenerate = [
        { month: nextMonth.getMonth() + 1, year: nextMonth.getFullYear() },
        {
          month: nextTwoMonths.getMonth() + 1,
          year: nextTwoMonths.getFullYear(),
        },
        {
          month: nextThreeMonths.getMonth() + 1,
          year: nextThreeMonths.getFullYear(),
        },
      ];

      for (const monthToGenerate of monthsToGenerate) {
        const existingFee = existingFees.find(
          (fee) =>
            fee.month === monthToGenerate.month &&
            fee.year === monthToGenerate.year,
        );

        if (!existingFee) {
          // Si no existe una cuota para el mes, crear una nueva cuota
          const newFee = this.feeRepository.create({
            student,
            startDate: new Date(
              monthToGenerate.year,
              monthToGenerate.month - 1,
              1,
            ),
            endDate: new Date(monthToGenerate.year, monthToGenerate.month, 0), // Último día del mes
            value: 0, // iria el valor de la cuota segun el deporte
            amountPaid: 0, // Inicialmente el monto pagado es cero,
            month: monthToGenerate.month,
            year: monthToGenerate.year,
          });
          await this.feeRepository.save(newFee);
        }
      }
    }
  }

  // @Cron('10 * * * * *')
  @Cron('0 0 1 * * *')
  async generateNextMonthFeesCron() {
    await this.generateNextThreeMonthsFees();
    this.logger.log('Called when the current second is 45');
  }
}
