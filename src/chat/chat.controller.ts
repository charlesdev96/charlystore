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
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "src/auth/guards";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { SendMessageDto } from "./dto/sendMessage.dto";
import { currentUser } from "src/auth/decorators/currentUser.decorator";
import { User, Message } from "generated/prisma";
import { PaginatedResponseData, ResponseData } from "src/common/interfaces";
import { PaginatedQueryDto } from "src/common/dto";

@UseGuards(JwtAuthGuard, GlobalThrottlerMessage)
@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("send-message")
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @currentUser() user: User,
  ): Promise<ResponseData> {
    return await this.chatService.sendMessage(user, sendMessageDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get("chat-history/:id")
  async chatHistory(
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: PaginatedQueryDto,
    @currentUser() user: User,
  ): Promise<PaginatedResponseData<Message>> {
    return await this.chatService.chatHistory(user, id, query);
  }
}
