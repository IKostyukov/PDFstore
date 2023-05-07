import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID('all', { each: true })
  @IsOptional()
  id: string;

  @IsNotEmpty({ message: 'email should be provided' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'password should be provided' })
  @IsStrongPassword()
  password: string;

  @IsString({ message: 'bad request' })
  firstName: string;

  @IsString({ message: 'bad request' })
  lastName: string;

  @IsString({ message: 'bad request' })
  @IsOptional()
  image?: string;

  @IsOptional()
  pdf?: Uint8Array;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}
