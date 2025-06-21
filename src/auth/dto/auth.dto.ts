import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserRole } from "src/common/enums";

export class RegisterDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: "password should not be less than 6 characters long",
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, {
    message: "name should not be less than 6 characters long",
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: UserRole;
}

export class LoginDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: "password should not be less than 6 characters long",
  })
  password: string;
}
