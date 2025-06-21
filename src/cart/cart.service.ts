import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Store, User } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { AddItemToCartDto, UpdateCartItemDto } from "./dto";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto } from "src/common/dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addItemToCart(
    user: User,
    addItemToCartDto: AddItemToCartDto,
  ): Promise<ResponseData> {
    //check if product exist
    const product = await this.prisma.product.findUnique({
      where: {
        productId: addItemToCartDto.productId,
      },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with product id: ${addItemToCartDto.productId} not found`,
      );
    }
    //check if user has already added the item to cart before
    const alreadyAdded = await this.prisma.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId: addItemToCartDto.productId,
      },
    });
    if (alreadyAdded) {
      throw new ConflictException("Product already exist in user cart");
    }
    const addItem = await this.prisma.cartItem.create({
      data: {
        ...addItemToCartDto,
        storeId: product.storeId,
        userId: user.userId,
        quantity: addItemToCartDto.quantity ?? 1,
      },
    });
    return {
      success: true,
      message: "Item successfully added to your cart",
      data: addItem,
    };
  }

  async userCartItem(
    user: User,
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Store>> {
    //it is also good to group them by stores
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    //count total cart items
    const totalItems = await this.prisma.cartItem.count({
      where: { userId: user.userId },
    });
    const items = await this.prisma.store.findMany({
      where: {
        CartItem: {
          some: {
            userId: user.userId,
          },
        },
      },
      select: {
        storeId: true,
        storeName: true,
        description: true,
        CartItem: {
          where: { userId: user.userId },
          select: {
            cartId: true,
            quantity: true,
            product: {
              select: {
                productId: true,
                price: true,
                images: true,
                title: true,
                description: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
      success: true,
      message: "List of all items in your cart",
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
      data: items,
    };
    return responseData;
  }

  async removeCartItem(cartId: string, user: User): Promise<ResponseData> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { cartId: cartId },
    });
    if (!cartItem) {
      throw new NotFoundException(`cart item with id: ${cartId} was not found`);
    }
    //check if cart belongs to user
    if (cartItem.userId.toString() !== user.userId.toString()) {
      throw new UnauthorizedException(
        "You are only allowed to delete cart items that belong to your account.",
      );
    }
    await this.prisma.cartItem.delete({
      where: { cartId: cartId },
    });
    return {
      success: true,
      message: "Item successfully removed",
    };
  }

  async updateCartItem(
    cartId: string,
    user: User,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<ResponseData> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { cartId: cartId },
    });
    if (!cartItem) {
      throw new NotFoundException(`cart item with id: ${cartId} was not found`);
    }
    //check if cart belongs to user
    if (cartItem.userId.toString() !== user.userId.toString()) {
      throw new UnauthorizedException(
        "You are only allowed to delete cart items that belong to your account.",
      );
    }
    const updatedItem = await this.prisma.cartItem.update({
      where: { cartId: cartId },
      data: {
        ...updateCartItemDto,
      },
    });
    return {
      success: true,
      message: "Cart item successfully updated",
      data: updatedItem,
    };
  }
}
