import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { Payload, ResponseData } from "src/common/interfaces";
import * as bcrypt from "bcryptjs";
import { UserRole } from "src/common/enums";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
    });
    //if user do not exist throw error
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: "User not found",
      });
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      //email should be case insensitive
      where: { email: email.toLowerCase() },
    });
    return user;
  }

  async signUp(registerDto: RegisterDto): Promise<ResponseData> {
    const alreadyRegistered = await this.alreadyRegisteredUser(
      registerDto.email.toLowerCase(),
    );
    if (alreadyRegistered) {
      throw new ConflictException({
        message: `User is this email: ${registerDto.email} already exist`,
      });
    }
    const hashedPassword = this.hashPassword(registerDto.password);

    const newUser = await this.prisma.user.create({
      data: {
        ...registerDto,
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.User,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser;
    return {
      success: true,
      message: "User successfully registered",
      data: result,
    };
  }

  async singIn(loginDto: LoginDto): Promise<ResponseData> {
    const message: string = "Invalid credentials provided";
    //check if user exist
    const user = await this.findUserByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException({ success: false, message: message });
    }
    //compare password
    const passwordMatch = this.comparePassword(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException({ success: false, message: message });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    const token = await this.generateToken(user);
    return {
      success: true,
      message: `Welcome back ${user.name} to charly store`,
      data: result,
      token: token,
    };
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  private async alreadyRegisteredUser(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  private async generateToken(user: User): Promise<string> {
    const payload: Payload = {
      userId: user.userId,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "2h",
    });
  }
}
