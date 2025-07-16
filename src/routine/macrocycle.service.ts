import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Macrocycle } from './macrocycle.entity';

@Injectable()
export class MacrocycleService {
  constructor(
    @InjectRepository(Macrocycle)
    private macrocycleRepo: Repository<Macrocycle>,
  ) {}

  create(data: Partial<Macrocycle>) {
    const macro = this.macrocycleRepo.create(data);
    return this.macrocycleRepo.save(macro);
  }

  findAll() {
    return this.macrocycleRepo.find({ relations: ['mesocycles'] });
  }

  findOne(id: number) {
    return this.macrocycleRepo.findOne({ where: { id }, relations: ['mesocycles'] });
  }

  update(id: number, data: Partial<Macrocycle>) {
    return this.macrocycleRepo.update(id, data);
  }

  remove(id: number) {
    return this.macrocycleRepo.delete(id);
  }
}
