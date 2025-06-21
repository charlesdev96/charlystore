import { Module } from "@nestjs/common";
import { NotFoundController } from "./error/notFoundRoute.error";

@Module({
  controllers: [NotFoundController],
})
export class CommonModule {}
