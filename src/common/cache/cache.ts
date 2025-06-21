import { PaginatedQueryDto, SearchQueryDto } from "../dto";

export const listKeys: Set<string> = new Set();

export const generateListCacheKey = (query: PaginatedQueryDto): string => {
  const { page = 1, limit = 10 } = query;
  return `list_page: ${page} limit: ${limit}`;
};

export const idReturnCacheKey = (id: string): string => {
  return `same_id: ${id}`;
};

export const generateSearchCacheKey = (query: SearchQueryDto): string => {
  return `stores:search:${query.search.toLowerCase()}:page=${query.page}:limit=${query.limit}`;
};
