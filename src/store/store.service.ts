import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Store, User } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreDto, UpdateStoreDto } from "./dto";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { UserRole } from "src/common/enums";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  listKeys,
  generateListCacheKey,
  idReturnCacheKey,
  generateSearchCacheKey,
} from "../common/cache/cache";
import { Cache } from "cache-manager";
import { minutes } from "@nestjs/throttler";

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async alreadyUsedStoreName(storeName: string): Promise<Store | null> {
    return await this.prisma.store.findUnique({
      where: {
        storeName: storeName.toLowerCase().trim(),
      },
    });
  }

  private async alreadyUpgraded(userId: string): Promise<Store | null> {
    return await this.prisma.store.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  async upgradeAccount(
    user: User,
    createStoreDto: CreateStoreDto,
  ): Promise<ResponseData> {
    const alreadyUpgraded = await this.alreadyUpgraded(user.userId);
    if (alreadyUpgraded) {
      throw new UnauthorizedException(
        "You have already upgraded your account to vendor",
      );
    }
    //check if store name is already used
    const storeNameAlreadyused = await this.alreadyUsedStoreName(
      createStoreDto.storeName.toLowerCase().trim(),
    );
    if (storeNameAlreadyused) {
      throw new ConflictException("Store name already used by another user");
    }
    //proceed to create store
    const store = await this.prisma.store.create({
      data: {
        ...createStoreDto,
        userId: user.userId,
        storeName: createStoreDto.storeName.toLowerCase().trim(),
      },
    });
    //update user details
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        role: UserRole.Vendor,
        storeId: store.storeId,
      },
    });
    return {
      success: true,
      message: "Congratulations, you have been successfully upgraded",
      data: store,
    };
  }

  async updateStore(
    user: User,
    updateStoreDto: UpdateStoreDto,
  ): Promise<ResponseData> {
    if (updateStoreDto.storeName) {
      //check if store name is already used
      const storeNameAlreadyused = await this.alreadyUsedStoreName(
        updateStoreDto.storeName.toLowerCase().trim(),
      );
      if (storeNameAlreadyused) {
        throw new ConflictException("Store name already used by another user");
      }
    }
    const updatedStore = await this.prisma.store.update({
      where: { userId: user.userId },
      data: {
        ...updateStoreDto,
        storeName: updateStoreDto.storeName?.toLowerCase().trim(),
      },
    });
    return {
      success: true,
      message: "Congratulations, you have successfully updated your store",
      data: updatedStore,
    };
  }

  async getAllStores(
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Store>> {
    //check if the user has called the endpoint in the last 30minutes
    const cacheKeys = generateListCacheKey(query);
    listKeys.add(cacheKeys);
    const getCacheData =
      await this.cacheManager.get<PaginatedResponseData<Store>>(cacheKeys);
    //if there is an exisiting data, return it
    if (getCacheData) {
      console.log(
        `Cache Hit --------> Returning stores from cache: ${cacheKeys}`,
      );
      return getCacheData;
    }
    //else continue with the rest of the query
    console.log(
      `Cache Miss -------> Fetching stores from database: ${cacheKeys}`,
    );
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const totalItems = await this.prisma.store.count({});
    const items = await this.prisma.store.findMany({
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            name: true,
          },
        },
      },
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<Store> = {
      success: true,
      message: "List of all stores",
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
    //now store the new data in the cache memory
    await this.cacheManager.set(cacheKeys, responseData, minutes(10));
    return responseData;
  }

  async searchStores(
    query: SearchQueryDto,
  ): Promise<PaginatedResponseData<Store>> {
    // Generate cache key including search term
    const cacheKeys = generateSearchCacheKey(query);
    listKeys.add(cacheKeys);
    // Check cache first
    const cachedData =
      await this.cacheManager.get<PaginatedResponseData<Store>>(cacheKeys);
    if (cachedData) {
      console.log(
        `Cache Hit --------> Returning search results from cache: ${cacheKeys}`,
      );
      return cachedData;
    }
    console.log(
      `Cache Miss -------> Fetching search results from database: ${cacheKeys}`,
    );
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    // Build search query (case-insensitive)
    const whereClause = {
      OR: [
        { storeName: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        },
      ],
    };

    const [totalItems, items] = await Promise.all([
      this.prisma.store.count({ where: whereClause }),
      this.prisma.store.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              userId: true,
              email: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // Optional: Add sorting
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<Store> = {
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
    // Cache the search results (shorter TTL than getAllStores since searches are more dynamic)
    await this.cacheManager.set(cacheKeys, responseData, minutes(5));
    return responseData;
  }

  async getSingleStore(storeId: string): Promise<ResponseData> {
    //check if the user has called the endpoint in the last 30minutes
    const cacheKeys = idReturnCacheKey(storeId);
    listKeys.add(cacheKeys);
    const getCacheData = await this.cacheManager.get<ResponseData>(cacheKeys);
    //if there is an exisiting data, return it
    if (getCacheData) {
      console.log(
        `Cache Hit --------> Returning single store from cache: ${cacheKeys}`,
      );
      return getCacheData;
    }
    //else continue with the rest of the query
    console.log(
      `Cache Miss -------> Fetching single store from database: ${cacheKeys}`,
    );
    const store = await this.prisma.store.findUnique({
      where: { storeId: storeId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            name: true,
          },
        },
      },
    });
    if (!store) {
      throw new NotFoundException(`Store with id: ${storeId} not found`);
    }
    const response = {
      success: true,
      message: "Store retrived successfully",
      data: store,
    };
    //now store the new data in the cache memory
    await this.cacheManager.set(cacheKeys, response, minutes(10));
    return response;
  }

  async getStoreById(storeId: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: { storeId: storeId },
    });
    if (!store) {
      throw new NotFoundException(`Store with id: ${storeId} not found`);
    }
    return store;
  }
}
