import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateStoreDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;
}
