import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Day } from './day.entity';
import { Microcycle } from './microcycle.entity';

@Injectable()
export class DayService {
  constructor(
    @InjectRepository(Day)
    private dayRepo: Repository<Day>,
    @InjectRepository(Microcycle)
    private microcycleRepo: Repository<Microcycle>,
  ) {}

  create(microcycleId: number, data: Partial<Day>) {
    return this.microcycleRepo.findOne({ where: { id: microcycleId } }).then(microcycle => {
      if (!microcycle) throw new Error('Microcycle not found');
      const day = this.dayRepo.create({ ...data, microcycle });
      return this.dayRepo.save(day);
    });
  }

  findAll(microcycleId: number) {
    return this.dayRepo.find({ where: { microcycle: { id: microcycleId } }, relations: ['exercises'] });
  }

  findOne(id: number) {
    return this.dayRepo.findOne({ where: { id }, relations: ['exercises'] });
  }

  update(id: number, data: Partial<Day>) {
    return this.dayRepo.update(id, data);
  }

  remove(id: number) {
    return this.dayRepo.delete(id);
  }
}
