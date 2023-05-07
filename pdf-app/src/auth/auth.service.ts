import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  public async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    const access = await this.comparePassword(pass, user.password);
    if (!access) {
      throw new UnauthorizedException('Wrong login or password. Try again');
    }
    const payload = { username: user.email, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }

  public async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
    // Store hash in the database
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    const result = await bcrypt.compare(password, hash);
    return result;
  }
}
