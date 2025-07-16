import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesocycle } from './mesocycle.entity';
import { Macrocycle } from './macrocycle.entity';

@Injectable()
export class MesocycleService {
  constructor(
    @InjectRepository(Mesocycle)
    private mesocycleRepo: Repository<Mesocycle>,
    @InjectRepository(Macrocycle)
    private macrocycleRepo: Repository<Macrocycle>,
  ) {}

  create(macrocycleId: number, data: Partial<Mesocycle>) {
    return this.macrocycleRepo.findOne({ where: { id: macrocycleId } }).then(macrocycle => {
      if (!macrocycle) throw new Error('Macrocycle not found');
      const meso = this.mesocycleRepo.create({ ...data, macrocycle });
      return this.mesocycleRepo.save(meso);
    });
  }

  findAll(macrocycleId: number) {
    return this.mesocycleRepo.find({ where: { macrocycle: { id: macrocycleId } }, relations: ['microcycles'] });
  }

  findOne(id: number) {
    return this.mesocycleRepo.findOne({ where: { id }, relations: ['microcycles'] });
  }

  update(id: number, data: Partial<Mesocycle>) {
    return this.mesocycleRepo.update(id, data);
  }

  remove(id: number) {
    return this.mesocycleRepo.delete(id);
  }
}
