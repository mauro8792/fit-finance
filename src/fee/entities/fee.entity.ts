import { Payment } from "src/payment/entities/payment.entity";
import { Student } from "src/student/entities/student.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'fees' })
export class Fee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  value: number;

  @Column({ default: 0 }) // Valor predeterminado para el monto pagado (0 al inicio)
  amountPaid: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @OneToMany(() => Payment, (payment) => payment.fee)
  payments: Payment[];

  @ManyToOne(() => Student, (student) => student.fees)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
