import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';
import { Roles } from '../roles/role.decorator';
import { Role } from '../roles/role.enum';
import { RolesGuard } from '../roles/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const isFirstUserExist = await this.userService.isUsersExist();

      if (isFirstUserExist) {
        const user = await this.userService.findOneUserByEmail(createUserDto.email);
        if (user) {
          throw new Error('Email already in use');
        }
      } else {
        createUserDto.roles = [Role.Admin];
      }

      const hashPassword = await this.authService.hashPassword(createUserDto.password);
      createUserDto.password = hashPassword;
      const { password, ...result } = await this.userService.createUser(createUserDto);
      return result;
    } catch (err) {
      console.log(err);
      return err.message;
    }
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  public async findAllUsers(): Promise<User[]> {
    try {
      return await this.userService.findAllUsers();
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  public async findOneUser(@Param('id') userId: string): Promise<User> {
    try {
      const { password, ...result } = await this.userService.findOneUser(userId);
      return result;
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @Patch(':userId')
  @UseGuards(AuthGuard)
  public async updateUser(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { password, ...result } = await this.userService.updateUser(userId, updateUserDto);
      return result;
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @Patch('admin/:userId')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  public async setUserAsAdmin(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { password, ...result } = await this.userService.updateUserToAdmin(userId, updateUserDto);
      return result;
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  public async removeUser(@Param('id') userId: string): Promise<DeleteResult> {
    try {
      return await this.userService.removeUser(userId);
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  @Post('pdf')
  @UseGuards(AuthGuard)
  public async addPdfToUser(@Body() updateUserDto: UpdateUserDto): Promise<{ result: boolean }> {
    try {
      const user = await this.userService.findOneUserByEmail(updateUserDto.email);
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
