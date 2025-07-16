import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetEntity } from './set.entity';
import { Exercise } from './exercise.entity';

@Injectable()
export class SetService {
  constructor(
    @InjectRepository(SetEntity)
    private setRepo: Repository<SetEntity>,
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
  ) {}

  create(exerciseId: number, data: Partial<SetEntity>) {
    return this.exerciseRepo.findOne({ where: { id: exerciseId } }).then(exercise => {
      if (!exercise) throw new Error('Exercise not found');
      const set = this.setRepo.create({ ...data, exercise });
      return this.setRepo.save(set);
    });
  }

  findAll(exerciseId: number) {
    return this.setRepo.find({ where: { exercise: { id: exerciseId } } });
  }

  findOne(id: number) {
    return this.setRepo.findOne({ where: { id } });
  }

  update(id: number, data: Partial<SetEntity>) {
    return this.setRepo.update(id, data);
  }

  remove(id: number) {
    return this.setRepo.delete(id);
  }
}
