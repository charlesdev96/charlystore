/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY")
    private readonly cloudinary: any,
  ) {}

  uploadFile(file: Express.Multer.File): Promise<{
    publicId: string;
    secureUrl: string;
    thumbnailUrl?: string;
  }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: "hallway",
          resource_type: "auto",
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) reject(error);
          const data = {
            publicId: result.public_id,
            secureUrl: result.secure_url,
          };
          if (result.resource_type === "video") {
            const baseUrl = result.secure_url.split("/upload/")[0];
            const videoPath = result.secure_url.split("/upload/")[1];
            const thumbnailUrl = `${baseUrl}/upload/w_300,h_200,c_fill/so_1/${videoPath.replace(".mp4", ".jpg")}`;

            return resolve({ ...data, thumbnailUrl });
          }

          resolve(data);
          // resolve(result);
        },
      );
      //convert the file buffer to a readable stream and pipe to the upload stream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return await this.cloudinary.uploader.destroy(publicId);
  }
}
