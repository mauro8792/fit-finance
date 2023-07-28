import { IsBoolean, IsDate, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { SportName } from "src/common/types/sport.enum";

export class CreateStudentDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'startDate must be a valid date in the format YYYY-MM-DD',
  })
  birthDate: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @MinLength(7)
  @MaxLength(9)
  document: string;

  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'startDate must be a valid date in the format YYYY-MM-DD',
  })
  startDate: string;

  @IsString()
  @IsOptional()
  sport: SportName;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
