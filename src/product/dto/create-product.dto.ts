import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: "description should be 4 characters and above" })
  description: string;

  @IsNumber({ allowNaN: false }, { message: "Price must be a number" })
  @IsPositive({ message: "Price must be a positive number" })
  price: number;

  @IsArray()
  @IsUrl(undefined, { each: true, message: "Each image must be a valid URL" })
  images: string[];

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: "title should be 4 characters and above" })
  title: string;
}
