import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { currentUser } from "src/auth/decorators/currentUser.decorator";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { JwtAuthGuard } from "src/auth/guards";
import { User } from "generated/prisma";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { UpdateUserDto } from "./dto/user.dto";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";

@UseGuards(GlobalThrottlerMessage, JwtAuthGuard)
@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}
  // @UseGuards(JwtAuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async myProfile(@currentUser() user: User): Promise<ResponseData> {
    return await this.userService.getUserProfile(user);
  }

  @HttpCode(HttpStatus.OK)
  @Get("all-users")
  async allUsers(
    @Query() paginatedQueryDto: PaginatedQueryDto,
    @currentUser() user: User,
  ): Promise<PaginatedResponseData<User>> {
    return await this.userService.getAllUsers(paginatedQueryDto, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get("search")
  async searchStores(
    @Query() query: SearchQueryDto,
  ): Promise<PaginatedResponseData<User>> {
    return await this.userService.searchUsers(query);
  }

  @Patch("update-profile")
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() updateProfileDto: UpdateUserDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.userService.updateProfile(user, updateProfileDto);
  }
}
