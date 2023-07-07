
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.save(createUserDto);
      return user;
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException('Ayuda!');
  }
}
