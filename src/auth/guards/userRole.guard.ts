import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "src/common/enums";
import { UserRolesKey } from "../decorators/userRoles.decorator";
import { AuthService } from "../auth.service";

@Injectable()
export class RolesGuards implements CanActivate {
  //reflector is used to access metadata set by the Roles decorator
  constructor(
    private reflector: Reflector,
    private authservice: AuthService,
  ) {}

  //canactivate acts like a next function
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      UserRolesKey,
      [context.getHandler(), context.getClass()],
    );

    //if endpoint does not require authentication, return true
    if (!requiredRoles) {
      return true;
    } else {
      //extract user from the payload
      const request = context.switchToHttp().getRequest();
      const userId: string = request.user.userId;
      const user = await this.authservice.findUserById(userId);
      if (!user) {
        throw new UnauthorizedException({ message: "User not authenticated" });
      }
      const hasPermissions = requiredRoles.some(
        (role) => role === (user.role as UserRole),
      );
      if (!hasPermissions) {
        throw new ForbiddenException({
          message: "You do not have permission to access this route",
        });
      } else {
        //since they have permission, return true
        return true;
      }
    }
  }
}
