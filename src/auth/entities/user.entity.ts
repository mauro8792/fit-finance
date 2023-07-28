import { MaxLength, MinLength } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from 'src/roles/entities/rol.entity';

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


  @Column('bool', { default: true })
  isActive: boolean;

  @ManyToMany(() => Role, {eager:true})
  @JoinTable()
  roles: Role[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.roles = this.roles.filter((role) => !!role);
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}

