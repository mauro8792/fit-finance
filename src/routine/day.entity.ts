import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Microcycle } from './microcycle.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class Day {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Microcycle, micro => micro.days, { onDelete: 'CASCADE' })
  microcycle: Microcycle;

  @OneToMany(() => Exercise, exercise => exercise.day, { cascade: true })
  exercises: Exercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
