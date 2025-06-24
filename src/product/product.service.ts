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
    // for (const product of products) {
    //   product.storeId = user.storeId;
    //   product.userId = user.userId;
    // }
    // const newProducts = await this.prisma.product.createMany({
    //   data: products,
    // });
    // console.log("products:", newProducts);
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

// const products = [
//   {
//     title: "Smart LED Bulb",
//     description: "Color-changing smart bulb with app control.",
//     price: 15.99,
//     images: ["https://example.com/products/bulb1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Wireless Keyboard",
//     description: "Compact Bluetooth keyboard for tablets and laptops.",
//     price: 27.5,
//     images: ["https://example.com/products/keyboard2.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "VR Headset",
//     description: "Immersive VR headset compatible with smartphones.",
//     price: 89.0,
//     images: ["https://example.com/products/vr1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Power Bank",
//     description: "10000mAh fast-charging portable power bank.",
//     price: 21.49,
//     images: ["https://example.com/products/powerbank1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Streaming Microphone",
//     description: "Professional USB microphone for podcasts and streaming.",
//     price: 56.75,
//     images: ["https://example.com/products/mic1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Graphics Tablet",
//     description: "Drawing tablet with pressure-sensitive pen.",
//     price: 68.99,
//     images: ["https://example.com/products/tablet2.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Digital Alarm Clock",
//     description: "LED display clock with temperature and USB port.",
//     price: 18.99,
//     images: ["https://example.com/products/clock1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Smart Thermostat",
//     description: "Energy-saving smart thermostat with app control.",
//     price: 134.95,
//     images: ["https://example.com/products/thermostat1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Photo Printer",
//     description: "Compact photo printer with wireless printing.",
//     price: 99.5,
//     images: ["https://example.com/products/printer1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "LED Ring Light",
//     description: "Dimmable ring light for video calls and content creation.",
//     price: 24.99,
//     images: ["https://example.com/products/ringlight1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Electric Toothbrush",
//     description: "Rechargeable toothbrush with multiple brushing modes.",
//     price: 42.0,
//     images: ["https://example.com/products/toothbrush1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Air Purifier",
//     description: "HEPA filter air purifier for home and office use.",
//     price: 75.0,
//     images: ["https://example.com/products/purifier1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "HDMI Switch",
//     description: "3-in-1 HDMI switch for multiple input devices.",
//     price: 13.99,
//     images: ["https://example.com/products/hdmi1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Laptop Cooler",
//     description: "Cooling pad with adjustable fan speeds and LED lights.",
//     price: 29.49,
//     images: ["https://example.com/products/cooler1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Surge Protector",
//     description: "6-outlet surge protector with USB charging ports.",
//     price: 22.5,
//     images: ["https://example.com/products/surge1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Car Phone Mount",
//     description: "Magnetic phone mount for car dashboards.",
//     price: 11.75,
//     images: ["https://example.com/products/mount1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Wireless Doorbell",
//     description: "Waterproof wireless doorbell with LED indicator.",
//     price: 17.99,
//     images: ["https://example.com/products/doorbell1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Cordless Drill",
//     description: "Rechargeable cordless drill with variable speed control.",
//     price: 59.0,
//     images: ["https://example.com/products/drill1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Smart Scale",
//     description: "Body composition smart scale with app sync.",
//     price: 36.25,
//     images: ["https://example.com/products/scale1.jpg"],
//     storeId: "",
//     userId: "",
//   },
//   {
//     title: "Noise Blocking Earmuffs",
//     description: "Adjustable earmuffs for industrial noise protection.",
//     price: 26.0,
//     images: ["https://example.com/products/earmuffs1.jpg"],
//     storeId: "",
//     userId: "",
//   },
// ];
