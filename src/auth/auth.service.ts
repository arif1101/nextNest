import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User as UserEntity, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(RegisterDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: RegisterDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        'Email already i use! Please try with a diff emaol',
      );
    }
    const hashedPassword = await this.hashPassword(RegisterDto.password);

    const newlyCreatedUser = this.usersRepository.create({
      email: RegisterDto.email,
      name: RegisterDto.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const savedUser = await this.usersRepository.save(newlyCreatedUser);
    const { password, ...result } = savedUser;

    return {
      user: result,
      message: 'Registration successfully! Please login to continue',
    };
  }

  async createAdmin(RegisterDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: RegisterDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        'Email already i use! Please try with a diff emaol',
      );
    }
    const hashedPassword = await this.hashPassword(RegisterDto.password);

    const newlyCreatedUser = this.usersRepository.create({
      email: RegisterDto.email,
      name: RegisterDto.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const savedUser = await this.usersRepository.save(newlyCreatedUser);
    const { password, ...result } = savedUser;

    return {
      user: result,
      message: 'Admin user created successfully! Please login to continue',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or account not exists',
      );
    }

    // generate the tokens
    const tokens = this.generateTokens(user);
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateTokens(user: UserEntity) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: UserEntity): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
    };
    return this.jwtService.sign(payload, {
      secret: 'refresh_secret',
      expiresIn: '7D',
    });
  }
}
