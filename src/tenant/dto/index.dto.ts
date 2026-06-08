import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/enums/index.enum';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role: Role;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  password: string;

  @IsString()
  displayName: string;
}

export class RevokeInvitationDto {
  @IsEmail()
  email: string;
}
