import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtAuthGuard, RolesGuards } from "src/auth/guards";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { Roles } from "src/auth/decorators/userRoles.decorator";
import { UserRole } from "src/common/enums";
import { CreateProductDto } from "./dto";
import { currentUser } from "src/auth/decorators/currentUser.decorator";
import { Product, User } from "generated/prisma";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";

@UseGuards(JwtAuthGuard, GlobalThrottlerMessage)
@Controller("product")
export class ProductController {
  constructor(private productService: ProductService) {}

  @Roles(UserRole.Vendor)
  @UseGuards(RolesGuards)
  @Post("add-product")
  @HttpCode(HttpStatus.CREATED)
  async addProduct(
    @Body() createProductDto: CreateProductDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.productService.addProduct(user, createProductDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get("all-product")
  async getAllStores(
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Product>> {
    return await this.productService.getAllProducts(query);
  }

  @Roles(UserRole.Vendor)
  @UseGuards(RolesGuards)
  @HttpCode(HttpStatus.OK)
  @Get("my-products")
  async myProducts(
    @Query() query: PaginatedQueryDto,
    @currentUser() user: User,
  ): Promise<PaginatedResponseData<Product>> {
    return await this.productService.myProducts(query, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get("search")
  async searchStores(
    @Query() query: SearchQueryDto,
  ): Promise<PaginatedResponseData<Product>> {
    return await this.productService.searchProduct(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async singleProduct(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ResponseData> {
    return this.productService.getSingleProduct(id);
  }
}
