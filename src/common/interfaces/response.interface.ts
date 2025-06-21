export interface SuccessMessage {
  success: boolean;
  message: string;
}

export interface ResponseData extends SuccessMessage {
  data?: any;
  token?: string;
}

export interface PaginatedMetaData {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponseData<T> extends SuccessMessage {
  data: T[];
  meta: PaginatedMetaData;
}
