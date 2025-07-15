import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/rol.entity';
import { User } from '../auth/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { Student } from '../student/entities/student.entity';
import { StudentService } from '../student/student.service';
import { Coach } from '../coach/entities/coach.entity';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly studentService: StudentService,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const roles = await this.insertRoles();
    await this.insertUsers(roles);
    const sports = await this.insertSports();
    const coaches = await this.insertCoaches();
    await this.insertStudentsWithUsers(sports, roles, coaches);
    
    return {
      message: 'Seed executed successfully!',
      rolesCreated: initialData.roles.length,
      usersCreated: initialData.users.length,
      sportsCreated: initialData.sports.length,
      coachesCreated: initialData.coaches.length,
      studentsCreated: initialData.students.length,
    };
  }

  private async deleteTables() {
    // Eliminar estudiantes primero (por las relaciones)
    await this.studentRepository.createQueryBuilder().delete().where({}).execute();
    // Eliminar coaches
    await this.coachRepository.createQueryBuilder().delete().where({}).execute();
    // Eliminar usuarios (por las relaciones)
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
    // Eliminar deportes
    await this.sportRepository.createQueryBuilder().delete().where({}).execute();
    // Luego eliminar roles
    await this.roleRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async insertCoaches() {
    const seedCoaches = initialData.coaches;
    const coaches: Coach[] = [];
    for (const coachData of seedCoaches) {
      // Crear usuario para el coach
      const hashedPassword = await bcrypt.hash(coachData.password, 10);
      const user = this.userRepository.create({
        email: coachData.email,
        fullName: `${coachData.firstName} ${coachData.lastName}`,
        password: hashedPassword,
        roles: [], // Podés asignar un rol específico si lo deseas
      });
      const savedUser = await this.userRepository.save(user);
      // Crear coach
      const coach = this.coachRepository.create({
        user: savedUser,
        salary: coachData.salary,
        specialty: coachData.specialty,
      });
      const savedCoach = await this.coachRepository.save(coach);
      coaches.push(savedCoach);
    }
    return coaches;
  }

  private async insertRoles() {
    const seedRoles = initialData.roles;

    const roles: Role[] = [];

    seedRoles.forEach((roleData) => {
      roles.push(this.roleRepository.create(roleData));
    });

    const dbRoles = await this.roleRepository.save(roles);

    return dbRoles;
  }

  private async insertUsers(roles: Role[]) {
    const seedUsers = initialData.users;

    const users: User[] = [];

    for (const userData of seedUsers) {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Buscar los roles por nombre
      const userRoles = roles.filter(role => 
        userData.roles.includes(role.name)
      );

      const user = this.userRepository.create({
        email: userData.email,
        fullName: userData.fullName,
        password: hashedPassword,
        roles: userRoles,
      });

      users.push(user);
    }

    const dbUsers = await this.userRepository.save(users);
    
    return dbUsers;
  }

  private async insertSports() {
    const seedSports = initialData.sports;

    const sports: Sport[] = [];

    seedSports.forEach((sportData) => {
      sports.push(this.sportRepository.create(sportData));
    });

    const dbSports = await this.sportRepository.save(sports);
    
    return dbSports;
  }

  private async insertStudentsWithUsers(sports: Sport[], roles: Role[], coaches: Coach[]) {
    const seedStudents = initialData.students;
    const userRole = roles.find(role => role.name === 'user');
    if (!userRole) {
      throw new Error('User role not found');
    }
    const createdStudents: Student[] = [];
    for (const studentData of seedStudents) {
      // Buscar el deporte por nombre
      const sport = sports.find(s => s.name === studentData.sportName);
      if (!sport) {
        console.warn(`Sport ${studentData.sportName} not found for student ${studentData.firstName}`);
        continue;
      }
      // Buscar el coach por email
      let coach = null;
      if (studentData.coachEmail) {
        coach = coaches.find(c => c.user.email === studentData.coachEmail);
        if (!coach) {
          console.warn(`Coach ${studentData.coachEmail} not found for student ${studentData.firstName}`);
        }
      }
      // Crear el usuario primero
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const user = this.userRepository.create({
        email: studentData.email,
        fullName: `${studentData.firstName} ${studentData.lastName}`,
        password: hashedPassword,
        roles: [userRole],
      });
      const savedUser = await this.userRepository.save(user);
      // Crear el estudiante con el usuario y coach relacionado
      const student = this.studentRepository.create({
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        birthDate: new Date(studentData.birthDate),
        phone: studentData.phone,
        startDate: new Date(studentData.startDate),
        document: studentData.document,
        isActive: studentData.isActive,
        sport: { id: sport.id } as Sport,
        user: { id: savedUser.id } as User,
        coach: coach ? { id: coach.id } as Coach : undefined,
      });
      const savedStudent = await this.studentRepository.save(student);
      // Generar las cuotas para el estudiante
      await this.studentService.generateFeesForNewStudent(savedStudent.id);
      createdStudents.push(savedStudent);
    }
    return createdStudents;
  }
}

