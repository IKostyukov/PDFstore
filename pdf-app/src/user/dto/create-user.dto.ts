export class CreateUserDto {
  id: string;

  email: string;

  firstName: string;

  lastName: string;

  image?: string;

  pdf?: Uint8Array;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}
