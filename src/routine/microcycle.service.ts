import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Microcycle } from './microcycle.entity';
import { Mesocycle } from './mesocycle.entity';

@Injectable()
export class MicrocycleService {
  constructor(
    @InjectRepository(Microcycle)
    private microcycleRepo: Repository<Microcycle>,
    @InjectRepository(Mesocycle)
    private mesocycleRepo: Repository<Mesocycle>,
  ) {}

  create(mesocycleId: number, data: Partial<Microcycle>) {
    return this.mesocycleRepo.findOne({ where: { id: mesocycleId } }).then(mesocycle => {
      if (!mesocycle) throw new Error('Mesocycle not found');
      const micro = this.microcycleRepo.create({ ...data, mesocycle });
      return this.microcycleRepo.save(micro);
    });
  }

  findAll(mesocycleId: number) {
    return this.microcycleRepo.find({ where: { mesocycle: { id: mesocycleId } }, relations: ['days'] });
  }

  findOne(id: number) {
    return this.microcycleRepo.findOne({ where: { id }, relations: ['days'] });
  }

  update(id: number, data: Partial<Microcycle>) {
    return this.microcycleRepo.update(id, data);
  }

  remove(id: number) {
    return this.microcycleRepo.delete(id);
  }
}
