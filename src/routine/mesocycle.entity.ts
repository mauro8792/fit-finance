import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Macrocycle } from './macrocycle.entity';
import { Microcycle } from './microcycle.entity';

@Entity()
export class Mesocycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Macrocycle, macro => macro.mesocycles, { onDelete: 'CASCADE' })
  macrocycle: Macrocycle;

  @OneToMany(() => Microcycle, micro => micro.mesocycle, { cascade: true })
  microcycles: Microcycle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
