// payment.entity.ts
import { Fee } from 'src/fee/entities/fee.entity';
import { Student } from 'src/student/entities/student.entity';
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

  @ManyToOne(() => Student, (student) => student.payments, { eager: false })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Fee, (fee) => fee.payments)
  @JoinColumn({ name: 'feeId' })
  fee: Fee;
}
