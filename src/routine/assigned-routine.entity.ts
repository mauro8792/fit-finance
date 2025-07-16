import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Macrocycle } from './macrocycle.entity';

@Entity()
export class AssignedRoutine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Macrocycle, macro => macro.id, { onDelete: 'CASCADE' })
  macrocycle: Macrocycle;

  @CreateDateColumn()
  assignedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
