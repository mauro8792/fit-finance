import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { Student } from 'src/student/entities/student.entity';
import { Fee } from 'src/fee/entities/fee.entity';
import { ERROR_DB } from 'src/constants';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger('PaymentService');
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    // @InjectRepository(Fee)
    // private readonly feeRepository: Repository<Fee>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { studentId, feeId, amountPaid, paymentDate } = createPaymentDto;

    const student = await this.studentRepository.findOneBy({ id: +studentId });

    if (!student) {
      throw new NotFoundException(`Student id: ${studentId} not found`);
    }

    const fee = student.fees.find((f) => f.id === feeId);

    if (!fee) throw new NotFoundException(`Fee id: ${feeId} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feeRepository = queryRunner.manager.getRepository(Fee);

      const newFee = await feeRepository
        .createQueryBuilder()
        .update(Fee)
        .set({ amountPaid })
        .where('id = :id', { id: fee.id })
        .execute();
      console.log('newFee', { newFee });

      const payment = await queryRunner.manager.save(Payment, {
        amountPaid,
        paymentDate,
        fee,
        student: student,
      });

      await queryRunner.commitTransaction();

      return { payment };
    } catch (error) {
      this.handleDBExceptions(error)
      
      await queryRunner.rollbackTransaction();
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage || error);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
