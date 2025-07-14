// payment.entity.ts
import { Fee } from '../../fee/entities/fee.entity';
import { Student } from '../../student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';


@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentDate: Date;

  @Column()
  amountPaid: number;

  @Column('')
  paymentMethod: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  externalId: string;

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => Student, (student) => student.payments, { eager: false })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Fee, (fee) => fee.payments)
  @JoinColumn({ name: 'feeId' })
  fee: Fee;
}

