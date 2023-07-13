import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/rol.entity';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    await this.insertRoles();
    return `This action returns all seed`;
  }

  private async deleteTables() {
    const queryBuilder = this.roleRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertRoles() {
    const seedRoles = initialData.roles;

    const roles: Role[] = [];

    seedRoles.forEach((u) => {
      roles.push(this.roleRepository.create(u));
    });

    const dbRoles = await this.roleRepository.save(seedRoles);

    return dbRoles[0];
  }
}
