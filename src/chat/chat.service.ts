import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { User, Message } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { SendMessageDto } from "./dto/sendMessage.dto";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto } from "src/common/dto";
import { AuthService } from "src/auth/auth.service";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private authService: AuthService,
    private readonly gatewayService: ChatGateway,
  ) {}

  async sendMessage(
    user: User,
    sendMessageDto: SendMessageDto,
  ): Promise<ResponseData> {
    //check if receiver exist
    try {
      const receiver = await this.authService.findUserById(
        sendMessageDto.receiverId,
      );
      if (!receiver) {
        throw new NotFoundException("Receiver not found");
      }
      const chat = await this.prisma.message.create({
        data: {
          ...sendMessageDto,
          senderId: user.userId,
        },
      });
      // Send real-time message if receiver is online
      this.gatewayService.sendRealTimeMessage(
        receiver.userId,
        user.userId,
        chat,
      );
      return {
        success: true,
        message: "Message successfully sent",
        data: chat,
      };
    } catch (error) {
      console.error("Send Message Error:", error);
      throw new InternalServerErrorException(
        "error occured while sending message",
      );
    }
  }

  async chatHistory(
    user: User,
    id: string,
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponseData<Message>> {
    const { limit = 15, page = 1 } = query;
    const skip = (page - 1) * limit;
    const userWithChatHistory = await this.authService.findUserById(id);

    const whereClause = {
      OR: [
        { senderId: user.userId, receiverId: id },
        { senderId: id, receiverId: user.userId },
      ],
    };
    const totalItems = await this.prisma.message.count({
      where: whereClause,
    });
    const items = await this.prisma.message.findMany({
      where: whereClause,
      select: {
        messageId: true,
        content: true,
        sender: {
          select: {
            userId: true,
            name: true,
          },
        },
        receiver: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const responseData: PaginatedResponseData<any> = {
      success: true,
      message: `Your chat history with ${userWithChatHistory.name}`,
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
