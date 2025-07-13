import { Payment } from "src/payment/entities/payment.entity";
import { Sport } from "src/sport/entities/sport.entity";
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

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'partial', 'completed'], 
    default: 'pending' 
  })
  status: 'pending' | 'partial' | 'completed';

  @Column()
  month: number;

  @Column()
  year: number;

  @OneToMany(() => Payment, (payment) => payment.fee, { eager: true })
  payments: Payment[];

  @ManyToOne(() => Student, (student) => student.fees, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Sport, (sport) => sport.fees)
  @JoinColumn({ name: 'sportId' })
  sport: Sport;
}
