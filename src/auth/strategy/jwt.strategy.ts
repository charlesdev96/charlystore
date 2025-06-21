import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { Payload } from "src/common/interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    if (!process.env.JWT_SECRET) {
      throw new BadRequestException("Missing jwt secret");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: Payload): Promise<any> {
    try {
      if (!payload.userId) {
        throw new UnauthorizedException("Missing userId in token payload");
      }
      const user = await this.authService.findUserById(payload.userId);
      if (!user) {
        throw new NotFoundException({
          message: "Invalid token provided because user was not found",
        });
      }
      return {
        ...user,
        role: user.role,
        userId: user.userId,
      };
    } catch (error: any) {
      console.log("jwt error:", error);
      throw new UnauthorizedException({ message: "Invalid token provided" });
    }
  }
}
