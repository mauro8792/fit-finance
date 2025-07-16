import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignedRoutine } from './assigned-routine.entity';
import { Macrocycle } from './macrocycle.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(AssignedRoutine)
    private assignedRoutineRepo: Repository<AssignedRoutine>,
    @InjectRepository(Macrocycle)
    private macrocycleRepo: Repository<Macrocycle>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // CRUD básico para AssignedRoutine (asignar rutina a usuario)
  async assignRoutine(userId: number, macrocycleId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const macrocycle = await this.macrocycleRepo.findOneBy({ id: macrocycleId });
    if (!user || !macrocycle) throw new Error('User or Macrocycle not found');
    const assigned = this.assignedRoutineRepo.create({ user, macrocycle });
    return this.assignedRoutineRepo.save(assigned);
  }

  async getAssignedRoutines(userId: number) {
    return this.assignedRoutineRepo.find({
      where: { user: { id: userId } },
      relations: ['macrocycle'],
    });
  }

  async unassignRoutine(assignedRoutineId: number) {
    return this.assignedRoutineRepo.delete(assignedRoutineId);
  }
}
