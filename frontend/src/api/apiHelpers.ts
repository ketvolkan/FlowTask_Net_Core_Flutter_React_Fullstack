import { PagedResponse } from '../types';

export function normalizePagedResponse<T>(input: any): PagedResponse<T> {
  if (!input) {
    return {
      items: [],
      pageIndex: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  let data = input;
  // If wrapped in axios response or DataResult: unwrap as long as data.data exists and has nested data/items
  if (
    data &&
    typeof data === 'object' &&
    data.data !== undefined &&
    !Array.isArray(data.data) &&
    typeof data.data === 'object' &&
    data.data !== null
  ) {
    if (data.data.data !== undefined || data.data.items !== undefined) {
      data = data.data;
    }
  }

  // If data is already an array
  if (Array.isArray(data)) {
    return {
      items: data,
      pageIndex: 1,
      pageSize: data.length,
      totalCount: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  // If data is { items: [...] }
  if (Array.isArray(data.items)) {
    return {
      items: data.items,
      pageIndex: data.pageIndex || data.page || 1,
      pageSize: data.pageSize || data.items.length,
      totalCount: data.totalCount ?? data.items.length,
      totalPages: data.totalPages ?? 1,
      hasPreviousPage: data.hasPreviousPage ?? false,
      hasNextPage: data.hasNextPage ?? false,
    };
  }

  // If data is { data: [...], pagination: {...} }
  if (Array.isArray(data.data)) {
    const page = data.pagination?.page || 1;
    const pageSize = data.pagination?.pageSize || data.data.length || 20;
    const totalCount = data.pagination?.totalCount ?? data.data.length;
    return {
      items: data.data,
      pageIndex: page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      hasPreviousPage: page > 1,
      hasNextPage: page * pageSize < totalCount,
    };
  }

  return {
    items: [],
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
