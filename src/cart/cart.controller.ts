import {
  Body,
  Controller,
  Delete,
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
import { CartService } from "./cart.service";
import { JwtAuthGuard } from "src/auth/guards";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { AddItemToCartDto, UpdateCartItemDto } from "./dto";
import { Store, User } from "generated/prisma";
import { currentUser } from "src/auth/decorators/currentUser.decorator";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto } from "src/common/dto";

@UseGuards(JwtAuthGuard, GlobalThrottlerMessage)
@Controller("cart")
export class CartController {
  constructor(private cartService: CartService) {}

  @Post("add-item")
  @HttpCode(HttpStatus.CREATED)
  async addcartItem(
    @Body() addItemTocartDto: AddItemToCartDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.cartService.addItemToCart(user, addItemTocartDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get("all-item")
  async getAllStores(
    @Query() query: PaginatedQueryDto,
    @currentUser() user: User,
  ): Promise<PaginatedResponseData<Store>> {
    return await this.cartService.userCartItem(user, query);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(":id")
  async updateCart(
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Param("id", ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.cartService.updateCartItem(id, user, updateCartItemDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async deleteItem(
    @Param("id", ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.cartService.removeCartItem(id, user);
  }
}
