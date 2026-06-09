import { IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
