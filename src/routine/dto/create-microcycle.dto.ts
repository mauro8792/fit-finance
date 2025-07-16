import { IsString, IsArray, ValidateNested, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class SetDto {
  @IsInt()
  reps: number;

  @IsInt()
  load: number;

  @IsOptional()
  @IsInt()
  expectedRir?: number;

  @IsOptional()
  @IsInt()
  actualRir?: number;

  @IsOptional()
  @IsInt()
  actualRpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ExerciseDto {
  @IsString()
  name: string;

  @IsString()
  muscle: string;

  @IsString()
  type: string;

  @IsString()
  repRange: string;

  @IsString()
  tempo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}

class DayDto {
  @IsInt()
  number: number;

  @IsString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises: ExerciseDto[];
}

export class CreateMicrocycleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  days?: DayDto[];
}
