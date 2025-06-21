import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Product, User } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDto } from "./dto";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { StoreService } from "src/store/store.service";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private storeService: StoreService,
  ) {}

  async addProduct(
    user: User,
    createProductDto: CreateProductDto,
  ): Promise<ResponseData> {
    if (!user.storeId) {
      throw new BadRequestException("No store id found for user");
    }
    const store = await this.storeService.getStoreById(user.storeId);

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        storeId: store.storeId,
        userId: user.userId,
      },
    });
    //   for (const product of products) {
    //     product.storeId = user.storeId;
    //     product.userId = user.userId;
    //   }
    //   const newProducts = await this.prisma.product.createMany({
    //     data: products,
    //   });
    //   console.log("products:", newProducts);
    return {
      success: true,
      message: "Product successfully added",
      data: product,
    };
  }

  async getAllProducts(
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Product>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    //apart from the logged in user
    const totalItems = await this.prisma.product.count({});
    const items = await this.prisma.product.findMany({
      select: {
        productId: true,
        title: true,
        description: true,
        images: true,
        price: true,
        store: {
          select: {
            storeId: true,
            storeName: true,
            description: true,
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
      success: true,
      message: "List of all products",
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
  async myProducts(
    query: PaginatedQueryDto,
    user: User,
  ): Promise<PaginatedResponseData<Product>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    //apart from the logged in user
    const totalItems = await this.prisma.product.count({
      where: { userId: user.userId },
    });
    const items = await this.prisma.product.findMany({
      where: { userId: user.userId },
      select: {
        productId: true,
        title: true,
        description: true,
        images: true,
        price: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
      success: true,
      message: "List of all your products",
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

  async searchProduct(
    query: SearchQueryDto,
  ): Promise<PaginatedResponseData<Product>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    // Build search query (case-insensitive)
    const whereClause = {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    };

    const [totalItems, items] = await Promise.all([
      this.prisma.product.count({ where: whereClause }),
      this.prisma.product.findMany({
        where: whereClause,
        select: {
          productId: true,
          title: true,
          description: true,
          images: true,
          price: true,
          store: {
            select: {
              storeId: true,
              storeName: true,
              description: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
      success: true,
      message: `Search results for: ${search}`,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
      data: items,
    };
    return responseData;
  }

  async getSingleProduct(productId: string): Promise<ResponseData> {
    const product = await this.prisma.product.findUnique({
      where: { productId: productId },
      select: {
        productId: true,
        description: true,
        price: true,
        images: true,
        title: true,
        store: {
          select: {
            storeId: true,
            storeName: true,
            description: true,
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id: ${productId} not found`);
    }
    return {
      success: true,
      message: "product successfully retrieved",
      data: product,
    };
  }
}
