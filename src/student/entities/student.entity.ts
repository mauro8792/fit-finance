import { MaxLength, MinLength } from 'class-validator';
import { SportName } from 'src/common/types/sport.enum';
import { Fee } from 'src/fee/entities/fee.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('varchar')
  sport: SportName;

  @Column('varchar', { unique: true })
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Fee, (fee) => fee.student, { eager: true })
  fees: Fee[];

  @OneToMany(() => Payment, (payment) => payment.student, { eager: false })
  payments: Payment[];
}
