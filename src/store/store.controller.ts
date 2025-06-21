import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { StoreService } from "./store.service";
import { JwtAuthGuard, RolesGuards } from "src/auth/guards";
import { Roles } from "src/auth/decorators/userRoles.decorator";
import { UserRole } from "src/common/enums";
import { CreateStoreDto, UpdateStoreDto } from "./dto";
import { currentUser } from "src/auth/decorators/currentUser.decorator";
import { Store, User } from "generated/prisma";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";

@UseGuards(JwtAuthGuard, GlobalThrottlerMessage)
@Controller("store")
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Roles(UserRole.User)
  @UseGuards(RolesGuards)
  @HttpCode(HttpStatus.CREATED)
  @Post("upgrade-account")
  async upgradeAccount(
    @Body() upgradeAccountDto: CreateStoreDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return this.storeService.upgradeAccount(user, upgradeAccountDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get("all-store")
  async getAllStores(
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Store>> {
    return await this.storeService.getAllStores(query);
  }

  @Roles(UserRole.Vendor)
  @UseGuards(RolesGuards)
  @HttpCode(HttpStatus.OK)
  @Patch("update-store")
  async updateStore(
    @Body() updateStoreDto: UpdateStoreDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return this.storeService.updateStore(user, updateStoreDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get("single-store/:storeId")
  async getSingleStore(
    @Param("storeId", ParseUUIDPipe) storeId: string,
  ): Promise<ResponseData> {
    return await this.storeService.getSingleStore(storeId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("search")
  async searchStores(
    @Query() query: SearchQueryDto,
  ): Promise<PaginatedResponseData<Store>> {
    return await this.storeService.searchStores(query);
  }
}
