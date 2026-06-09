import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ChangelogStatus, ChangelogType } from 'src/common/enums/index.enum';

export class CreateChangelogDto {
  @IsString()
  productId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(ChangelogType)
  type: ChangelogType;

  @IsEnum(ChangelogStatus)
  status: ChangelogStatus;

  @IsString()
  @IsOptional()
  version?: string;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;
}
