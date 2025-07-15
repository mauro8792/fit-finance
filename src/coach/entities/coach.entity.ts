import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Student } from '../../student/entities/student.entity';

@Entity({ name: 'coaches' })
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { nullable: true })
  salary: number;

  @Column('varchar', { nullable: true })
  specialty: string;

  @Column('text', { nullable: true })
  notes: string;

  @OneToMany(() => Student, (student) => student.coach)
  students: Student[];
}
