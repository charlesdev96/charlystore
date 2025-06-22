import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards";
import { GlobalThrottlerMessage } from "src/common/guards/global.throttler.guard";
import { UploadService } from "./upload.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ResponseData } from "src/common/interfaces";
import { DeleteFileDto } from "./dto/removeFile.dto";

@UseGuards(JwtAuthGuard, GlobalThrottlerMessage)
@Controller("upload")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor("file"))
  @Post("upload-multiple-files")
  async uploadMultipleFiles(
    @UploadedFiles() file: Express.Multer.File[],
  ): Promise<ResponseData> {
    return await this.uploadService.uploadMultipleFiles(file);
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  @Post("upload-single-file")
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseData> {
    return await this.uploadService.uploadSingleFile(file);
  }

  @Delete("delete-file")
  @HttpCode(HttpStatus.OK)
  async remove(@Body() deleteFileDto: DeleteFileDto): Promise<ResponseData> {
    return await this.uploadService.remove(deleteFileDto);
  }
}
