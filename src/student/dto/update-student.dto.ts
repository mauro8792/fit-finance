import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SportName } from 'src/common/types/sport.enum';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'startDate must be a valid date in the format YYYY-MM-DD',
  })
  birthDate: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'startDate must be a valid date in the format YYYY-MM-DD',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  sport: SportName;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
