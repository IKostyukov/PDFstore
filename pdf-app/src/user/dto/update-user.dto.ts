import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: 'first name should be provided' })
  @IsString({ message: 'bad request' })
  firstName: string;

  @IsNotEmpty({ message: 'last name should be provided' })
  @IsString({ message: 'bad request' })
  lastName: string;

  @IsNotEmpty({ message: 'image should be provided' })
  @IsString({ message: 'bad request' })
  @IsOptional()
  image?: string;
}
