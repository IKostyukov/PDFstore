import { catchError, firstValueFrom, map } from 'rxjs';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../roles/role.enum';
import * as pdfKit from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  public async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'image', 'pdf', 'roles', 'createdAt', 'updatedAt', 'deletedAt'],
    });
  }

  public async isUsersExist(): Promise<boolean> {
    const result = await this.userRepository.findAndCount();
    return result[1] === 0 ? false : true;
  }

  public async findOneUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    if (user.pdf) {
      fs.writeFile(`./example_from_db.pdf`, user.pdf, (err) => {
        if (err) console.log(err);
      });
      console.log('Pdf file loaded to the file example_from_db.pdf ');
    }
    return user;
  }

  public async findOneUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  public async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUser(userId);
    user.firstName = updateUserDto.firstName ?? updateUserDto.firstName;
    user.lastName = updateUserDto.lastName ?? updateUserDto.lastName;
    user.image = updateUserDto.image ?? updateUserDto.image;

    return await this.userRepository.save(user);
  }

  public async updateUserToAdmin(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneUser(userId);
    user.roles.push(Role.Admin);

    return await this.userRepository.save(user);
  }

  public async removeUser(userId: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: userId });
  }

  public async saveUserImage(url: string): Promise<boolean> {
    const image = await firstValueFrom(
      this.httpService
        .get(url, { responseType: 'stream' })
        .pipe(
          map((res) => {
            res.data.pipe(fs.createWriteStream(this.configService.get('JPG_FILE')));
          }),
        )
        .pipe(
          catchError((err) => {
            console.log(err);
            throw new ForbiddenException('Api not available', err);
          }),
        ),
    );
    console.log('The image has been uploaded');
    return true;
  }

  public async createPdf(firstName: string, lastName: string, image: string): Promise<boolean> {
    await this.sleep(1000);
    const pdfDoc = new pdfKit();
    let stream = fs.createWriteStream(this.configService.get('PDF_FILE'));
    pdfDoc.pipe(stream);
    pdfDoc.fontSize(20).fillColor('red').text(`${firstName} ${lastName}`, 150, 50, {
      link: image,
      underline: true,
    });
    pdfDoc.image(this.configService.get('JPG_FILE'), 150, 80, {
      width: 320,
      height: 240,
      align: 'center',
    });

    pdfDoc.end();
    console.log('PDF generate successfully');
    return true;
  }

  public async savePdf(user: User): Promise<boolean> {
    await this.sleep(1000);
    const pdfArrayBuffer = fs.readFileSync(this.configService.get('PDF_FILE'));
    user.pdf = pdfArrayBuffer;
    await this.userRepository.save(user);
    console.log('PDF saved successfully');
    return true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }
}
