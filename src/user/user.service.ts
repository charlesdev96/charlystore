import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { User } from "generated/prisma";
import { AuthService } from "src/auth/auth.service";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { compareSync, hashSync } from "bcryptjs";
import { UpdateUserDto } from "./dto/user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginatedQueryDto, SearchQueryDto } from "src/common/dto";

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserProfile(user: User): Promise<ResponseData> {
    const decodedUSer = await this.authService.findUserById(user.userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = decodedUSer;

    return {
      success: true,
      message: `Profile for ${user.name} successfully retrieved`,
      data: result,
    };
  }

  async searchUsers(
    query: SearchQueryDto,
  ): Promise<PaginatedResponseData<User>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    // Build search query (case-insensitive)
    const whereClause = {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    };

    const [totalItems, items] = await Promise.all([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        select: {
          userId: true,
          email: true,
          name: true,
          createdAt: true,
          role: true,
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

  async updateProfile(
    user: User,
    updateProfileDto: UpdateUserDto,
  ): Promise<ResponseData> {
    let updatedPassword: string | undefined;

    // If user is trying to change their password
    if (updateProfileDto.password && updateProfileDto.oldPassword) {
      const passwordMatch = compareSync(
        updateProfileDto.oldPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new BadRequestException("Old password is incorrect");
      }
      updatedPassword = hashSync(updateProfileDto.password, 10);
    }
    //email must be unique
    // Normalize email
    if (updateProfileDto.email) {
      const normalizedEmail = updateProfileDto.email.toLowerCase();

      const alreadyUseredEmail = await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (alreadyUseredEmail && alreadyUseredEmail.userId !== user.userId) {
        throw new ConflictException("Email is already in use by another user");
      }
    }
    // Prepare update data safely
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { oldPassword, email, ...restOfData } = updateProfileDto;
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        ...restOfData,
        ...(updatedPassword && { password: updatedPassword }), // Only update password if it's present
        ...(updateProfileDto.email && {
          email: updateProfileDto.email?.toLowerCase(),
        }),
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  }

  async getAllUsers(
    query: PaginatedQueryDto,
    user: User,
  ): Promise<PaginatedResponseData<User>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    //apart from the logged in user
    const totalItems = await this.prisma.user.count({
      where: {
        userId: {
          not: user.userId,
        },
      },
    });
    const items = await this.prisma.user.findMany({
      where: {
        userId: {
          not: user.userId,
        },
      },
      select: {
        userId: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
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
    return responseData;
  }
}
