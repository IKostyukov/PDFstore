import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userService.findOneByEmail(createUserDto.email);
      if (user) {
        throw new Error('Email already in use');
      }
      const hashPassword = await this.authService.hashPassword(createUserDto.password);
      createUserDto.password = hashPassword;
      const { password, ...result } = await this.userService.create(createUserDto);
      return result;
    } catch (err) {
      console.log(err);
      return err.message;
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  public async findAllUsers(): Promise<User[]> {
    try {
      return await this.userService.findAll();
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  public async findOneUser(@Param('id') id: string): Promise<User> {
    try {
      const { password, ...result } = await this.userService.findOne(id);
      return result;
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':userId')
  public async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { password, ...result } = await this.userService.update(id, updateUserDto);
      return result;
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  public async removeUser(@Param('id') id: string): Promise<DeleteResult> {
    try {
      return await this.userService.remove(id);
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @UseGuards(AuthGuard)
  @Post('pdf')
  public async addPdfToUser(@Body() updateUserDto: UpdateUserDto): Promise<{ result: boolean }> {
    try {
      const user = await this.userService.findOneByEmail(updateUserDto.email);
      if (!user) {
        throw new NotFoundException(`User ${updateUserDto.email} not found`);
      }
      await this.userService.saveUserImage(user.image);
      await this.userService.createPdf(user.firstName, user.lastName, user.image);
      await this.userService.savePdf(user);

      return { result: true };
    } catch (err) {
      console.log(err);
      return { result: err.message };
    }
  }
}
