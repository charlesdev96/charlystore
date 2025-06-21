import { IsNotEmpty, IsString } from "class-validator";

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
