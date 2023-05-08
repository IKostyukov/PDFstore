import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUUID } from 'class-validator';
import { Role } from 'src/roles/role.enum';

export class CreateUserDto {
  @IsUUID('all', { each: true })
  @IsOptional()
  public readonly id: string;

  @IsNotEmpty({ message: 'email should be provided' })
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty({ message: 'password should be provided' })
  @IsStrongPassword()
  public password: string;

  @IsString({ message: 'bad request' })
  public readonly firstName: string;

  @IsString({ message: 'bad request' })
  public readonly lastName: string;

  @IsString({ message: 'bad request' })
  @IsOptional()
  public readonly image?: string;

  @IsOptional()
  public readonly pdf?: Uint8Array;

  @IsOptional()
  @IsArray({ message: 'bad request' })
  public roles: Role[];

  public createdAt?: Date;

  public updatedAt?: Date;

  public deletedAt?: Date;
}
