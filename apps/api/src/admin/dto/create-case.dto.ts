import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  parties?: string;

  @IsString()
  court: string;

  @IsInt()
  @Min(1950)
  @Max(2030)
  year: number;

  @IsOptional()
  @IsString()
  citation?: string;

  @IsString()
  judgmentText: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  bench?: string;

  @IsOptional()
  @IsString()
  actsSections?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}
