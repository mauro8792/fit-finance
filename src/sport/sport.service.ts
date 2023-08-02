import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { Repository } from 'typeorm';
import { ERROR_DB } from 'src/constants';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class SportService {
  private readonly logger = new Logger('FeeService');

  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  async create(createSportDto: CreateSportDto) {
    this.logger.log(`Create sport`);

    try {
      const sport = this.sportRepository.create(createSportDto);

      await this.sportRepository.save(sport);

      return { sport };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, isActive } = paginationDto;

    const sports = await this.sportRepository.find({
      take: limit,
      skip: offset,
    });

    return { sports };
  }

  findOne(id: number) {
    return `This action returns a #${id} sport`;
  }

  async update(id: number, updateSportDto: UpdateSportDto) {
    const sport = await this.sportRepository.preload({
      id,
      ...updateSportDto,
    });

    if (!sport) throw new NotFoundException(`Sport with id: ${id} not found`);

    await this.sportRepository.save(sport);

    return { sport };
  }

  remove(id: number) {
    return `This action removes a #${id} sport`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.sqlMessage);
    if (error.code === ERROR_DB.ER_DUP_ENTRY)
      throw new BadRequestException(`${error.sqlMessage} `);
    throw new InternalServerErrorException('Ayuda!');
  }
}
