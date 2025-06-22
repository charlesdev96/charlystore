import { Module } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";
import { ClouidnaryProvider } from "./cloudinary.provider";

@Module({
  providers: [ClouidnaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
