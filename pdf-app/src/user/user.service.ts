import { catchError, firstValueFrom, map } from 'rxjs';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as pdfKit from 'pdfkit';
import * as fs from 'fs';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  public async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    if (user.pdf) {
      fs.writeFile(`./example_from_db.pdf`, user.pdf, (err) => {
        if (err) console.log(err);
      });
      console.log('Pdf file loaded to the file example_from_db.pdf ');
    }
    return user;
  }

  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    user.firstName = updateUserDto.firstName ?? updateUserDto.firstName;
    user.lastName = updateUserDto.lastName ?? updateUserDto.lastName;
    user.image = updateUserDto.image ?? updateUserDto.image;

    return await this.userRepository.save(user);
  }

  public async remove(id: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ id });
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
