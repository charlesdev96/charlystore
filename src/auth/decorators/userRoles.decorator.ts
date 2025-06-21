import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/common/enums";

export const UserRolesKey = "roles";

export const Roles = (...roles: UserRole[]) => SetMetadata(UserRolesKey, roles);
