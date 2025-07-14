import { MaxLength, MinLength } from 'class-validator';
import { SportName } from '../../common/types/sport.enum';
import { Fee } from '../../fee/entities/fee.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Sport } from '../../sport/entities/sport.entity';
import { User } from '../../auth/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  @MinLength(4)
  firstName: string;

  @Column('varchar')
  @MinLength(4)
  lastName: string;

  @Column('date')
  birthDate: Date;

  @Column('varchar')
  @MinLength(4)
  phone: string;

  @Column('date')
  startDate: Date;

  @Column('varchar', { unique: true })
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Fee, (fee) => fee.student, )
  fees: Fee[];

  @OneToMany(() => Payment, (payment) => payment.student, { eager: false })
  payments: Payment[];

  // @Column({ nullable: true }) // Hacemos el campo sportId opcional
  // sportId: number;

  @ManyToOne(() => Sport, (sport) => sport.students, {eager:true})
  @JoinColumn({ name: 'sportId' })
  sport: Sport;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
