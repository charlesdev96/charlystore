// src/auth/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === "TokenExpiredError") {
        throw new UnauthorizedException(
          "Your session has expired. Please login again.",
        );
      }

      if (info?.message === "No auth token") {
        throw new UnauthorizedException("No authentication token found");
      }

      throw new UnauthorizedException("Invalid or missing token");
    }

    return user;
  }
}
