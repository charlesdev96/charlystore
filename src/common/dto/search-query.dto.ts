import { IsNotEmpty, IsString } from "class-validator";
import { PaginatedQueryDto } from "./paginated-query.dto";

export class SearchQueryDto extends PaginatedQueryDto {
  @IsString()
  @IsNotEmpty()
  search: string;
}
