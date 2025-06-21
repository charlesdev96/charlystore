import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: "password should be more than 6" })
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: "password should be more than 6" })
  oldPassword?: string;
}
