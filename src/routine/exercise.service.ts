import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Day } from './day.entity';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
    @InjectRepository(Day)
    private dayRepo: Repository<Day>,
  ) {}

  create(dayId: number, data: Partial<Exercise>) {
    return this.dayRepo.findOne({ where: { id: dayId } }).then(day => {
      if (!day) throw new Error('Day not found');
      const exercise = this.exerciseRepo.create({ ...data, day });
      return this.exerciseRepo.save(exercise);
    });
  }

  findAll(dayId: number) {
    return this.exerciseRepo.find({ where: { day: { id: dayId } }, relations: ['sets'] });
  }

  findOne(id: number) {
    return this.exerciseRepo.findOne({ where: { id }, relations: ['sets'] });
  }

  update(id: number, data: Partial<Exercise>) {
    return this.exerciseRepo.update(id, data);
  }

  remove(id: number) {
    return this.exerciseRepo.delete(id);
  }
}
