import { Fee } from "src/fee/entities/fee.entity";
import { Student } from "src/student/entities/student.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('sports')
export class Sport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique:true})
  name: string;

  @Column({
    nullable: true
  })
  description: string;

  @Column()
  monthlyFee: number; // Valor de la cuota mensual del deporte

  @OneToMany(() => Fee, (fee) => fee.sport)
  fees: Fee[];

  @OneToMany(() => Student, (student) => student.sport)
  students: Student[];
}
