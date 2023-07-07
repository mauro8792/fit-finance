import { MaxLength, MinLength } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', {
    select: false,
  })
  @MinLength(8)
  password: string;

  @Column('varchar')
  @MinLength(8)
  fullName: string;

  @Column('date')
  birthDate: Date;

  @Column('varchar')
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('varchar', { default: 'user' })
  roles: string[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
