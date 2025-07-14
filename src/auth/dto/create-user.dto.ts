import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Sport } from '../../sport/entities/sport.entity';
export class CreateUserDto {
  @ApiProperty({
    example: 'ejemplo@gmail.com',
    description: 'User mail',
    uniqueItems: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @IsDate()
  birthDate: Date;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  sport: Sport;
}

