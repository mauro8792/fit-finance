import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { ERROR_DB } from '../constants';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from './dto';
import { Role } from '../roles/entities/rol.entity';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

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

    // Buscar usuario con sus roles
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Credential are not valid (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credential are not valid (password)');
    }

    // Verificar si es un estudiante (rol 'user')
    const isStudent = user.roles.some(role => role.name === 'user');
    let studentInfo = null;

    if (isStudent) {
      // Buscar información del estudiante
      const studentRepository = this.dataSource.getRepository(Student);
      const student = await studentRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['sport', 'user'],
      });

      if (student) {
        studentInfo = {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          document: student.document,
          phone: student.phone,
          birthDate: student.birthDate,
          startDate: student.startDate,
          isActive: student.isActive,
          sport: {
            id: student.sport.id,
            name: student.sport.name,
            monthlyFee: student.sport.monthlyFee,
          }
        };
      }
    }

    const { id, password: _, ...userData } = user;
    
    return {
      ...userData,
      token: this.getJwtToken({ id }),
      student: studentInfo,
      userType: isStudent ? 'student' : 'admin'
    };
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

  async getStudentDashboard(userId: number) {
    // Buscar el estudiante asociado al usuario, incluyendo el coach
    const studentRepository = this.dataSource.getRepository(Student);
    const student = await studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['sport', 'user', 'fees', 'fees.payments', 'coach', 'coach.user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }

    // Calcular estadísticas de cuotas
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Cuotas pendientes solo de meses vencidos o del mes actual
    const currentPendingFees = student.fees.filter(fee => {
      const feeDate = new Date(fee.year, fee.month - 1);
      const currentMonthDate = new Date(currentYear, currentMonth - 1);
      
      // Solo incluir cuotas que ya vencieron o son del mes actual
      return feeDate <= currentMonthDate && fee.amountPaid < fee.value;
    });

    const currentPending = currentPendingFees.reduce((sum, fee) => sum + (fee.value - fee.amountPaid), 0);

    // Cuotas del mes actual
    const currentMonthFees = student.fees.filter(
      fee => fee.month === currentMonth && fee.year === currentYear
    );

    // Cuotas pendientes (no pagadas completamente)
    const pendingFees = student.fees.filter(
      fee => fee.amountPaid < fee.value
    );

    // Cuotas desde el mes actual hacia adelante (incluyendo algunas pasadas)
    const recentFees = student.fees
      .filter(fee => {
        const feeDate = new Date(fee.year, fee.month - 1);
        const twoMonthsAgo = new Date(currentYear, currentMonth - 3); // 2 meses atrás
        const sixMonthsAhead = new Date(currentYear, currentMonth + 5); // 6 meses adelante
        return feeDate >= twoMonthsAgo && feeDate <= sixMonthsAhead;
      })
      .sort((a, b) => {
        // Ordenar por año y mes ascendente (cronológico: pasado → presente → futuro)
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(0, 6); // Mostrar hasta 6 cuotas

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        document: student.document,
        phone: student.phone,
        birthDate: student.birthDate,
        startDate: student.startDate,
        isActive: student.isActive,
      },
      sport: {
        id: student.sport.id,
        name: student.sport.name,
        monthlyFee: student.sport.monthlyFee,
      },
      coach: student.coach ? {
        id: student.coach.id,
        firstName: student.coach.user?.fullName?.split(', ')[1] || '',
        lastName: student.coach.user?.fullName?.split(', ')[0] || '',
        email: student.coach.user?.email || '',
      } : null,
      feesSummary: {
        totalPaid: student.fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
        totalPending: student.fees.reduce((sum, fee) => sum + (fee.value - fee.amountPaid), 0),
        currentPending: currentPending, // Solo cuotas vencidas o del mes actual
        currentMonthFees: currentMonthFees.map(fee => ({
          id: fee.id,
          month: fee.month,
          year: fee.year,
          amount: fee.value, // Cambiar 'value' por 'amount' para el frontend
          amountPaid: fee.amountPaid,
          startDate: fee.startDate,
          endDate: fee.endDate,
          isPaid: fee.amountPaid >= fee.value,
          paymentStatus: fee.amountPaid >= fee.value ? 'paid' : 
                        fee.amountPaid > 0 ? 'partial' : 'pending'
        })),
        pendingFeesCount: pendingFees.length,
        recentFees: recentFees.map(fee => ({
          id: fee.id,
          month: fee.month,
          year: fee.year,
          monthName: this.getMonthName(fee.month),
          amount: fee.value,
          amountPaid: fee.amountPaid,
          remainingAmount: fee.value - fee.amountPaid,
          startDate: fee.startDate,
          endDate: fee.endDate,
          dueDate: fee.endDate, // Fecha de vencimiento
          isPaid: fee.amountPaid >= fee.value,
          paymentStatus: fee.amountPaid >= fee.value ? 'paid' : 
                        fee.amountPaid > 0 ? 'partial' : 'pending',
          // Obtener fecha del último pago si existe
          lastPaymentDate: fee.payments && fee.payments.length > 0 ? 
            fee.payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate : null
        })),
      }
    };
  }

  async getStudentProfile(userId: number) {
    const studentRepository = this.dataSource.getRepository(Student);
    const student = await studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['sport', 'user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      document: student.document,
      phone: student.phone,
      birthDate: student.birthDate,
      startDate: student.startDate,
      isActive: student.isActive,
      sport: {
        id: student.sport.id,
        name: student.sport.name,
        monthlyFee: student.sport.monthlyFee,
      },
      user: {
        id: student.user.id,
        email: student.user.email,
        fullName: student.user.fullName,
      }
    };
  }

  async verifyToken(user: User) {
    const userWithRelations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles', 'student', 'student.sport'],
    });

    if (!userWithRelations) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isStudent = userWithRelations.roles.some(role => role.name === 'user');
    
    if (isStudent && userWithRelations.student) {
      return {
        user: {
          id: userWithRelations.id,
          email: userWithRelations.email,
          fullName: userWithRelations.fullName,
        },
        student: {
          id: userWithRelations.student.id,
          firstName: userWithRelations.student.firstName,
          lastName: userWithRelations.student.lastName,
          sport: userWithRelations.student.sport?.name,
        }
      };
    }

    return {
      user: {
        id: userWithRelations.id,
        email: userWithRelations.email,
        fullName: userWithRelations.fullName,
      }
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

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || `Mes ${month}`;
  }
}

