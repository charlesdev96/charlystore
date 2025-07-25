import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { minutes, ThrottlerModule } from "@nestjs/throttler";
import { StoreModule } from "./store/store.module";
import { CacheModule } from "@nestjs/cache-manager";
import { ProductModule } from "./product/product.module";
import { CartModule } from "./cart/cart.module";
import { UploadModule } from "./upload/upload.module";
import { LoggerMiddleware } from "./common/middleware";
import { ChatModule } from "./chat/chat.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: minutes(1), blockDuration: minutes(5), limit: 10 },
    ]),
    CacheModule.register({ isGlobal: true, ttl: minutes(30), max: 100 }),
    PrismaModule,
    AuthModule,
    UserModule,
    StoreModule,
    ProductModule,
    CartModule,
    UploadModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
