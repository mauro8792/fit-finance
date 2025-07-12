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
    const students = await this.getAllStudents();
    await this.generateFeesForStudents(students);
  }

  async generateNextThreeMonthsFeesForId(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    await this.generateFeesForStudents([student]);
  }

  private async getAllStudents(): Promise<Student[]> {
    return this.feeRepository.manager.getRepository(Student).find();
  }

  private async getStudentById(id: number): Promise<Student> {
    return this.feeRepository.manager.getRepository(Student).findOneBy({ id });
  }

  private async generateFeesForStudents(students: Student[]): Promise<void> {
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

    for (const student of students) {
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
        const existingFee = await this.feeRepository.findOne({
          where: {
            student: { id: student.id },
            month: monthToGenerate.month,
            year: monthToGenerate.year,
          },
        });

        if (!existingFee) {
          const newFee = this.feeRepository.create({
            student: { id: student.id } as Student,
            startDate: new Date(
              monthToGenerate.year,
              monthToGenerate.month - 1,
              1,
            ),
            endDate: new Date(monthToGenerate.year, monthToGenerate.month, 0), // Último día del mes
            value: student.sport.monthlyFee,
            amountPaid: 0,
            month: monthToGenerate.month,
            year: monthToGenerate.year,
          });
          await this.feeRepository.save(newFee);
        }
      }
    }
  }

  async generateFeesForNewStudent(studentId: number): Promise<void> {
    const student = await this.getStudentById(studentId);
    await this.generateFeesForStudents([student]);
  }

  // @Cron('10 * * * * *')
  @Cron('0 0 1 * * *')
  async generateNextMonthFeesCron() {
    await this.generateNextThreeMonthsFees();
    this.logger.log('Called when the current second is 45');
  }

  async validateSequentialPayment(studentId: number, feeId: number): Promise<{ isValid: boolean; message?: string; unpaidFees?: Fee[] }> {
    // Obtener la cuota que se quiere pagar
    const targetFee = await this.feeRepository.findOne({
      where: { id: feeId },
      relations: ['student']
    });

    if (!targetFee) {
      return {
        isValid: false,
        message: 'La cuota especificada no existe'
      };
    }

    if (targetFee.student.id !== studentId) {
      return {
        isValid: false,
        message: 'La cuota no pertenece al estudiante especificado'
      };
    }

    // Verificar si la cuota ya está completamente pagada
    if (targetFee.amountPaid >= targetFee.value) {
      return {
        isValid: false,
        message: 'Esta cuota ya está completamente pagada'
      };
    }

    // Obtener todas las cuotas anteriores no pagadas del estudiante
    const unpaidPreviousFees = await this.feeRepository
      .createQueryBuilder('fee')
      .where('fee.studentId = :studentId', { studentId })
      .andWhere('fee.startDate < :targetStartDate', { targetStartDate: targetFee.startDate })
      .andWhere('fee.amountPaid < fee.value') // Cuotas no completamente pagadas
      .orderBy('fee.startDate', 'ASC')
      .getMany();

    if (unpaidPreviousFees.length > 0) {
      return {
        isValid: false,
        message: `No se puede pagar la cuota de ${this.getMonthName(targetFee.month)} ${targetFee.year} porque tienes cuotas anteriores pendientes`,
        unpaidFees: unpaidPreviousFees
      };
    }

    return {
      isValid: true,
      message: 'El pago puede proceder'
    };
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }

  async getUnpaidFeesByStudent(studentId: number): Promise<Fee[]> {
    return await this.feeRepository
      .createQueryBuilder('fee')
      .where('fee.studentId = :studentId', { studentId })
      .andWhere('fee.amountPaid < fee.value')
      .orderBy('fee.startDate', 'ASC')
      .getMany();
  }

  async getStudentFeesWithDetails(studentId: number) {
    const fees = await this.feeRepository
      .createQueryBuilder('fee')
      .leftJoinAndSelect('fee.student', 'student')
      .leftJoinAndSelect('student.sport', 'sport')
      .leftJoinAndSelect('fee.payments', 'payments')
      .where('fee.studentId = :studentId', { studentId })
      .orderBy('fee.year', 'DESC')
      .addOrderBy('fee.month', 'DESC')
      .getMany();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const feesWithDetails = fees.map(fee => {
      const isPaid = fee.amountPaid >= fee.value;
      const isPartial = fee.amountPaid > 0 && fee.amountPaid < fee.value;
      const isPending = fee.amountPaid === 0;
      const isCurrent = fee.month === currentMonth && fee.year === currentYear;
      const isOverdue = (fee.year < currentYear) || (fee.year === currentYear && fee.month < currentMonth);

      return {
        id: fee.id,
        month: fee.month,
        year: fee.year,
        monthName: this.getMonthName(fee.month),
        value: fee.value,
        amountPaid: fee.amountPaid,
        remainingAmount: Math.max(0, fee.value - fee.amountPaid),
        startDate: fee.startDate,
        endDate: fee.endDate,
        status: isPaid ? 'paid' : isPartial ? 'partial' : 'pending',
        isCurrent,
        isOverdue: isOverdue && !isPaid,
        payments: fee.payments?.map(payment => ({
          id: payment.id,
          amount: payment.amountPaid,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
        })) || [],
        paymentCount: fee.payments?.length || 0,
      };
    });

    // Estadísticas
    const totalFees = feesWithDetails.length;
    const paidFees = feesWithDetails.filter(fee => fee.status === 'paid').length;
    const partialFees = feesWithDetails.filter(fee => fee.status === 'partial').length;
    const pendingFees = feesWithDetails.filter(fee => fee.status === 'pending').length;
    const overdueFees = feesWithDetails.filter(fee => fee.isOverdue).length;

    return {
      student: fees[0]?.student ? {
        id: fees[0].student.id,
        firstName: fees[0].student.firstName,
        lastName: fees[0].student.lastName,
        sport: fees[0].student.sport,
      } : null,
      summary: {
        total: totalFees,
        paid: paidFees,
        partial: partialFees,
        pending: pendingFees,
        overdue: overdueFees,
      },
      fees: feesWithDetails,
    };
  }
}
