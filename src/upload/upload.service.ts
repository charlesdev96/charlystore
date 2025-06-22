import { Injectable } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { ResponseData } from "src/common/interfaces";
import { DeleteFileDto } from "./dto/removeFile.dto";

@Injectable()
export class UploadService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<ResponseData> {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        return await this.cloudinaryService.uploadFile(file);
      }),
    );
    return {
      success: true,
      message: "file successfully uploaded",
      data: uploadedFiles,
    };
  }

  async uploadSingleFile(file: Express.Multer.File): Promise<ResponseData> {
    const uploadedFile = await this.cloudinaryService.uploadFile(file);
    return {
      success: true,
      message: "file successfully uploaded",
      data: uploadedFile,
    };
  }

  async remove(deleteFileDto: DeleteFileDto): Promise<ResponseData> {
    //delete from cloudinary
    await this.cloudinaryService.deleteFile(deleteFileDto.id);
    return {
      success: true,
      message: "Files deleted successfully",
    };
  }
}
