import { IsDateString, IsNotEmpty } from 'class-validator';

export class FindAllSchedulesDto {
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @IsDateString()
  @IsNotEmpty()
  end: string;
}
