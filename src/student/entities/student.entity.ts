import { MaxLength, MinLength } from 'class-validator';
import { SportName } from 'src/common/types/sport.enum';
import { Fee } from 'src/fee/entities/fee.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Sport } from 'src/sport/entities/sport.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
}
