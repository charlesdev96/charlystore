import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { AuthModule } from "src/auth/auth.module";
import { StoreModule } from "src/store/store.module";

@Module({
  imports: [AuthModule, StoreModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
