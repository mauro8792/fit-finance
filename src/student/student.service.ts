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

@Injectable()
export class StudentService {
  private readonly logger = new Logger('StudentService');

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const student = this.studentRepository.create(createStudentDto);
    try {
      await this.studentRepository.save(student);

      this.logger.log(`Student created ${student}`);
      return { student };
    } catch (error) {
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
    const student = await this.studentRepository.preload({
      id,
      ...updateStudentDto,
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
}
