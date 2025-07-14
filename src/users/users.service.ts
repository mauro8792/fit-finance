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

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR_DB } from '../constants';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
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
    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      // relations: ['roles'],
    });

    return users.map((user) => {
      console.log('user', user);
      return { ...user, roles: user.roles.map((r) => r.name) };
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
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
