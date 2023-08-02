import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { ERROR_DB } from 'src/constants';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from './dto';
import { Role } from 'src/roles/entities/rol.entity';
import { Student } from 'src/student/entities/student.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,

    private readonly dataSource: DataSource,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { email, password, ...studentPayload } = createUserDto;
    try {
      const role = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (!role) throw new BadRequestException('Not found role');

      const user = await queryRunner.manager.save(User, {
        email,
        fullName: `${studentPayload.lastName}, ${studentPayload.firstName}`,
        roles: [role],
        password: bcrypt.hashSync(password, 10),
      });

      await queryRunner.manager.save(Student, {
        ...studentPayload,
        startDate: new Date(),                
        user,
      });

      await queryRunner.commitTransaction();
      delete user.password;
      return { user };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credential are not valid (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credential are not valid (password)');
    }
    const { id, ...userData } = user;
    return { ...userData, token: this.getJwtToken({ id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
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
