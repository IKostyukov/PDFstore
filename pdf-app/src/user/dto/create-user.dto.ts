import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  id: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  image?: string;

  pdf?: Uint8Array;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}
