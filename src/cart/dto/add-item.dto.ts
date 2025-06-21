import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class AddItemToCartDto {
  @IsInt()
  @IsOptional()
  quantity?: number = 1;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  productId: string;
}
