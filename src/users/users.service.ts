import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR_DB } from 'src/constants';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { password, ...clientPayload } = createUserDto;
    try {
      const user = await queryRunner.manager.save(User, {
        ...clientPayload,
        password: bcrypt.hashSync(password, 10),
      });

      await queryRunner.commitTransaction();
      delete user.password;
      return { user };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.userRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
