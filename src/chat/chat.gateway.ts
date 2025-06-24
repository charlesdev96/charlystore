import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  //when a user connect
  async handleConnection(client: Socket) {
    console.log("User connected....", client.id);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      console.log("UserId found: ", userId);
    } else {
      console.warn("Anonymous connection attempt");
      client.disconnect();
      return;
    }
    this.onlineUsers.set(userId, client.id);
    await client.join(`user_${userId}`);

    // Notify others about the online status
    client.broadcast.emit("user-status-changed", {
      userId,
      isOnline: true,
      lastSeen: new Date(),
    });
  }

  //when a user disconnect
  handleDisconnect(client: Socket) {
    console.log("User disconnected...", client.id);
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      this.onlineUsers.delete(userId);

      // Notify others about the offline status
      client.broadcast.emit("user-status-changed", {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    }
  }

  // Handle incoming messages
  @SubscribeMessage("send-message")
  handleMessage(
    client: Socket,
    payload: { receiverId: string; content: string },
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!payload.content) {
      console.log("content not found");
      // return { status: "error", message: "Invalid message format" };
    }
    // Send to receiver if online
    const receiverSocketId = this.onlineUsers.get(payload.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit("new-message", payload.content);
    }

    const senderSocketId = this.onlineUsers.get(senderId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit("new-message", payload.content);
      return true;
    }
    return { status: "success", message: "Message sent", data: payload };
  }

  // Utility method to send message from service
  sendRealTimeMessage(receiverId: string, senderId: string, message: any) {
    const receiverSocketId = this.onlineUsers.get(receiverId);
    const senderSocketId = this.onlineUsers.get(senderId);
    let sent = false;
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit("incoming-message", message);
      sent = true;
    }
    if (senderSocketId) {
      this.server.to(senderSocketId).emit("incoming-message", message);
      sent = true;
    }
    return sent;
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, sid] of this.onlineUsers.entries()) {
      if (sid === socketId) return userId;
    }
    return undefined;
  }
}
