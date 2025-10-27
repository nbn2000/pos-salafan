// src/api/product-log.ts
import { baseApi } from '@/api';

// ==== API slice ====
export const productLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Flat product logs endpoint (original)
    getProductLogs: builder.query<
      ProductStockLogResponse,
      ProductLogQueryParams | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = 'comment',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          createdFrom,
          createdTo,
          type,
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          take,
          searchField,
          sortField,
          sortOrder,
        };
        if (search?.trim()) params.search = search.trim();
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (type) params.type = type;

        return { url: 'product-log', method: 'GET', params };
      },
      providesTags: ['PRODUCT_LOGS'],
    }),

    // Enhanced product logs endpoint with nested objects
    getProductNestedLogs: builder.query<
      ProductLogListResponse,
      ProductLogQueryParams | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = 'comment',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          createdFrom,
          createdTo,
          type,
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          take,
          searchField,
          sortField,
          sortOrder,
        };
        if (search?.trim()) params.search = search.trim();
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (type) params.type = type;

        return { url: 'product-log/logs', method: 'GET', params };
      },
      providesTags: ['PRODUCT_LOGS'],
    }),

    getProductLogById: builder.query<ProductStockLog, string>({
      query: (id) => ({ url: `product-log/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'PRODUCT_LOGS', id }],
    }),
  }),
});

export const { 
  useGetProductLogsQuery, 
  useGetProductNestedLogsQuery,
  useGetProductLogByIdQuery 
} = productLogsApi;
