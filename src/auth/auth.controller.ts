import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { ResponseData } from "src/common/interfaces";
import { minutes, Throttle } from "@nestjs/throttler";
import { LoginThrottlerMessage } from "./guards/login.throttler.guard";

@Controller("auth")
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Post("sign-up")
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() registerDto: RegisterDto): Promise<ResponseData> {
    return await this.authservice.signUp(registerDto);
  }

  @Throttle({
    default: { ttl: minutes(5), blockDuration: minutes(30), limit: 3 },
  })
  @UseGuards(LoginThrottlerMessage)
  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginDto): Promise<ResponseData> {
    return await this.authservice.singIn(loginDto);
  }
}
