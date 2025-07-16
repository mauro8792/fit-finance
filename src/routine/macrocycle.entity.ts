import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Mesocycle } from './mesocycle.entity';

@Entity()
export class Macrocycle {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  name: string;

  @Column()
  studentId: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @OneToMany(() => Mesocycle, meso => meso.macrocycle, { cascade: true })
  mesocycles: Mesocycle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
