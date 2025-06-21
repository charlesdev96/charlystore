import { IsInt, IsPositive } from "class-validator";

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}
