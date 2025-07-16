import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity()
export class SetEntity {
  @PrimaryGeneratedColumn()
  id: number;



  @Column('int')
  reps: number;

  @Column('int')
  load: number;

  @Column({ nullable: true })
  expectedRir: string;

  @Column('int', { nullable: true })
  actualRir: number;

  @Column('int', { nullable: true })
  actualRpe: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Exercise, exercise => exercise.sets, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
