import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UpdateStudentDto, CreateStudentDto } from './dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Student } from './entities/student.entity';
import { ERROR_DB } from 'src/constants';
import { Sport } from 'src/sport/entities/sport.entity';
import { FeeService } from 'src/fee/fee.service';
import { Fee } from 'src/fee/entities/fee.entity';

@Injectable()
export class StudentService {
  private readonly logger = new Logger('StudentService');

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,

    @InjectRepository(Fee)
    private readonly feeRepository: Repository<Fee>,

    private readonly dataSource: DataSource,

    private readonly feeService: FeeService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { sportId, ...studentPayload } = createStudentDto;

    const sport = sportId
      ? await this.sportRepository.findOneBy({ id: sportId })
      : '';

    if (!sport)
      throw new NotFoundException(`Sport with id: ${sportId} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const student = await queryRunner.manager.save(Student, {
        ...studentPayload,
        sport,
      });

      await queryRunner.commitTransaction();

      // Llama a la nueva función en StudentService para generar las cuotas
      await this.generateFeesForNewStudent(student.id);

      this.logger.log(`Student created`);
      return { student };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, isActive } = paginationDto;

    const students = await this.studentRepository.find({
      take: limit,
      skip: offset,
      where: {
        isActive: isActive,
      },
    });

    this.logger.log('Get all studentes');
    return students;
  }

  async findOne(term: string) {
    this.logger.log(`Get student by ${term}`);

    const isIdSearch = Number.isInteger(Number(term));

    let student: Student;

    if (isIdSearch) {
      student = await this.studentRepository.findOneBy({ id: +term });
    } else {
      const queryBuilder = this.studentRepository.createQueryBuilder('student');
      queryBuilder.where(
        `UPPER(student.firstName) LIKE :firstName OR UPPER(student.lastName) LIKE :lastName`,
        {
          firstName: `%${term.toUpperCase()}%`,
          lastName: `%${term.toUpperCase()}%`,
        },
      );
      student = await queryBuilder.getOne();
    }

    if (!student) {
      throw new NotFoundException(`Student with term: ${term} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const { sportId, ...studentPayload } = updateStudentDto;
    const sport = sportId
      ? await this.sportRepository.findOneBy({ id: sportId })
      : '';

    // if (!sport)
    //   throw new NotFoundException(`Sport with id: ${sportId} not found`);

    const student = await this.studentRepository.preload({
      id,
      ...studentPayload,
      ...(sport ? { sport } : {}),
    });

    if (!student)
      throw new NotFoundException(`Studen with id: "${id}" not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

    return { student };
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException('Ayuda!');
  }

  async generateFeesForNewStudent(studentId: number): Promise<void> {
    const student = await this.studentRepository.findOneBy({ id: studentId });

    if (!student) {
      throw new NotFoundException(`Student not found with id: ${studentId}`);
    }

    const today = new Date();
    const monthsToGenerate = [
      { month: today.getMonth() + 1, year: today.getFullYear() },
      { month: today.getMonth() + 2, year: today.getFullYear() },
      { month: today.getMonth() + 3, year: today.getFullYear() },
    ];

    for (const monthToGenerate of monthsToGenerate) {
      const existingFee = await this.feeRepository.findOne({
        where: {
          student,
          month: monthToGenerate.month,
          year: monthToGenerate.year,
        },
      });

      if (!existingFee) {
        const newFee = this.feeRepository.create({
          student,
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
