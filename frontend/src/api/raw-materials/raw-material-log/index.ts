// src/api/rawMaterialLogs.ts
import { baseApi } from '@/api';

// ==== RTK Query ====
export const rawMaterialLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Flat logs endpoint (original)
    getRawMaterialLogs: builder.query<
      RawMaterialLogResponse,
      RawMaterialLogQueryParams | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          searchField = 'comment',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          search,
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

        if (search) params.search = search;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (type) params.type = type;

        return {
          url: 'raw-material-log',
          method: 'GET',
          params,
        };
      },
      providesTags: ['RAW_MATERIAL_LOG'],
    }),

    // Enhanced nested logs endpoint
    getRawMaterialNestedLogs: builder.query<
      RawMaterialLogNestedResponse,
      PaginationQuery | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          searchField = 'comment',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          search,
          createdFrom,
          createdTo,
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          take,
          searchField,
          sortField,
          sortOrder,
        };

        if (search) params.search = search;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;

        return {
          url: 'raw-material-log/logs',
          method: 'GET',
          params,
        };
      },
      providesTags: ['RAW_MATERIAL_LOG'],
    }),

    // Legacy endpoint for backward compatibility
    getRawMaterialStockLogs: builder.query<
      RawMaterialStockLogResponse,
      (PaginationQuery & { type?: RawMaterialLogType }) | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          searchField = 'comment',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          search,
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

        if (search) params.search = search;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (type) params.type = type;

        return {
          url: 'raw-material-log',
          method: 'GET',
          params,
        };
      },
      providesTags: ['RAW_MATERIAL_LOG'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetRawMaterialLogsQuery,
  useGetRawMaterialNestedLogsQuery,
  useGetRawMaterialStockLogsQuery,
  useLazyGetRawMaterialLogsQuery,
  useLazyGetRawMaterialNestedLogsQuery,
  useLazyGetRawMaterialStockLogsQuery,
} = rawMaterialLogsApi;
