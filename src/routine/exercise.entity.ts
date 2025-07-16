import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Day } from './day.entity';
import { SetEntity } from './set.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  muscle: string;

  @Column()
  type: string;

  @Column()
  repRange: string;

  @Column()
  tempo: string;

  @ManyToOne(() => Day, day => day.exercises, { onDelete: 'CASCADE' })
  day: Day;

  @OneToMany(() => SetEntity, set => set.exercise, { cascade: true })
  sets: SetEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
