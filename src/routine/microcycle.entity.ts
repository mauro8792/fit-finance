import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Mesocycle } from './mesocycle.entity';
import { Day } from './day.entity';

@Entity()
export class Microcycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Mesocycle, meso => meso.microcycles, { onDelete: 'CASCADE' })
  mesocycle: Mesocycle;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;


  @Column({ nullable: true })
  objetivo?: string;

  @OneToMany(() => Day, day => day.microcycle, { cascade: true })
  days: Day[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
