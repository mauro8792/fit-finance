import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Microcycle } from './microcycle.entity';
import { Mesocycle } from './mesocycle.entity';
import { Day } from './day.entity';
import { Exercise } from './exercise.entity';
import { SetEntity } from './set.entity';
import { CreateMicrocycleDto } from './dto/create-microcycle.dto';

@Injectable()
export class MicrocycleService {
  constructor(
    @InjectRepository(Microcycle)
    private microcycleRepo: Repository<Microcycle>,
    @InjectRepository(Mesocycle)
    private mesocycleRepo: Repository<Mesocycle>,
  ) {}

  async create(mesocycleId: number, data: CreateMicrocycleDto) {
    const mesocycle = await this.mesocycleRepo.findOne({ where: { id: mesocycleId } });
    if (!mesocycle) throw new Error('Mesocycle not found');

    // Crear microciclo incluyendo fechas y objetivo si vienen
    const microcycle = this.microcycleRepo.create({
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      objetivo: data.objetivo,
      mesocycle,
    });
    const savedMicrocycle = await this.microcycleRepo.save(microcycle);

    // Crear días, ejercicios y sets anidados solo si se envían
    if (data.days && Array.isArray(data.days)) {
      for (const dayDto of data.days) {
        const day = new Day();
        day.number = (String(dayDto.number) !== '' && !isNaN(Number(dayDto.number))) ? Number(dayDto.number) : null;
        day.date = dayDto.date && dayDto.date !== '' ? dayDto.date : null;
        day.microcycle = savedMicrocycle;
        day.exercises = [];
        const savedDay = await (this as any).microcycleRepo.manager.save(day);

        for (const exDto of dayDto.exercises) {
          const exercise = new Exercise();
          exercise.name = exDto.name;
          exercise.muscle = exDto.muscle;
          exercise.type = exDto.type;
          exercise.repRange = exDto.repRange;
          exercise.tempo = exDto.tempo;
          exercise.day = savedDay;
          exercise.sets = [];
          const savedExercise = await (this as any).microcycleRepo.manager.save(exercise);

          for (const setDto of exDto.sets) {
            const reps = (String(setDto.reps) !== '' && !isNaN(Number(setDto.reps))) ? Number(setDto.reps) : null;
            const load = (String(setDto.load) !== '' && !isNaN(Number(setDto.load))) ? Number(setDto.load) : null;
            if (reps !== null && load !== null) {
              const set = new SetEntity();
              set.reps = reps;
              set.load = load;
              set.expectedRir = setDto.expectedRir !== undefined && setDto.expectedRir !== null ? String(setDto.expectedRir) : null;
              set.actualRir = (String(setDto.actualRir) !== '' && !isNaN(Number(setDto.actualRir))) ? Number(setDto.actualRir) : null;
              set.actualRpe = (String(setDto.actualRpe) !== '' && !isNaN(Number(setDto.actualRpe))) ? Number(setDto.actualRpe) : null;
              set.notes = setDto.notes ?? null;
              set.exercise = savedExercise;
              await (this as any).microcycleRepo.manager.save(set);
            }
          }
        }
      }
    }

    // Retornar el microciclo con días y ejercicios
    return this.microcycleRepo.findOne({
      where: { id: savedMicrocycle.id },
      relations: ['days', 'days.exercises', 'days.exercises.sets'],
    });
  }

  findAll(mesocycleId: number) {
    return this.microcycleRepo.find({ where: { mesocycle: { id: mesocycleId } }, relations: ['days'] });
  }

  findOne(id: number) {
    // Incluir ejercicios y sets en la respuesta del microciclo
    return this.microcycleRepo.findOne({
      where: { id },
      relations: ['days', 'days.exercises', 'days.exercises.sets'],
    });
  }


  async update(id: number, data: Partial<Microcycle>) {
    // Actualizar campos simples del microciclo
    await this.microcycleRepo.update(id, { name: data.name });

    // Eliminar días, ejercicios y sets anteriores
    const existingMicrocycle = await this.microcycleRepo.findOne({ where: { id }, relations: ['days', 'days.exercises', 'days.exercises.sets'] });
    if (existingMicrocycle && existingMicrocycle.days) {
      for (const day of existingMicrocycle.days) {
        if (day.exercises) {
          for (const exercise of day.exercises) {
            if (exercise.sets) {
              for (const set of exercise.sets) {
                await (this as any).microcycleRepo.manager.delete(SetEntity, set.id);
              }
            }
            await (this as any).microcycleRepo.manager.delete(Exercise, exercise.id);
          }
        }
        await (this as any).microcycleRepo.manager.delete(Day, day.id);
      }
    }

    // Crear nuevos días, ejercicios y sets
    if (data.days && Array.isArray(data.days)) {
      for (const dayDto of data.days) {
        const day = new Day();
        day.number = dayDto.number;
        day.date = dayDto.date && dayDto.date !== '' ? dayDto.date : null;
        day.number = (String(dayDto.number) !== '' && !isNaN(Number(dayDto.number))) ? Number(dayDto.number) : null;
        day.microcycle = { id } as Microcycle;
        day.exercises = [];
        const savedDay = await (this as any).microcycleRepo.manager.save(day);

        if (dayDto.exercises && Array.isArray(dayDto.exercises)) {
          for (const exDto of dayDto.exercises) {
            const exercise = new Exercise();
            exercise.name = exDto.name;
            exercise.muscle = exDto.muscle;
            exercise.type = exDto.type;
            exercise.repRange = exDto.repRange;
            exercise.tempo = exDto.tempo;
            exercise.day = savedDay;
            exercise.sets = [];
            const savedExercise = await (this as any).microcycleRepo.manager.save(exercise);

            if (exDto.sets && Array.isArray(exDto.sets)) {
              for (const setDto of exDto.sets) {
                const reps = (String(setDto.reps) !== '' && !isNaN(Number(setDto.reps))) ? Number(setDto.reps) : null;
                const load = (String(setDto.load) !== '' && !isNaN(Number(setDto.load))) ? Number(setDto.load) : null;
                if (reps !== null && load !== null) {
                  const set = new SetEntity();
                  set.reps = reps;
                  set.load = load;
                  set.expectedRir = setDto.expectedRir !== undefined && setDto.expectedRir !== null ? String(setDto.expectedRir) : null;
                  set.actualRir = (String(setDto.actualRir) !== '' && !isNaN(Number(setDto.actualRir))) ? Number(setDto.actualRir) : null;
                  set.actualRpe = (String(setDto.actualRpe) !== '' && !isNaN(Number(setDto.actualRpe))) ? Number(setDto.actualRpe) : null;
                  set.notes = setDto.notes ?? null;
                  set.exercise = savedExercise;
                  await (this as any).microcycleRepo.manager.save(set);
                }
              }
            }
          }
        }
      }
    }

    // Retornar el microciclo actualizado con días y ejercicios
    return this.microcycleRepo.findOne({
      where: { id },
      relations: ['days', 'days.exercises', 'days.exercises.sets'],
    });
  }

  remove(id: number) {
    return this.microcycleRepo.delete(id);
  }
}
