import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity()
export class SetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reps: string;

  @Column()
  load: string;

  @Column()
  expectedRir: string;

  @Column()
  actualRir: string;

  @Column()
  actualRpe: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Exercise, exercise => exercise.sets, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
