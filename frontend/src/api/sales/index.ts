// src/api/sales.ts
import { baseApi } from '@/api';

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSaleItems: builder.query<SaleListResponse, SaleBrowseQuery | void>({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = 'name',
          sortField = 'createdAt',
          sortOrder = 'DESC',
          createdFrom,
          createdTo,
          includeBatches = false,
        } = args ?? {};

        const params: Record<string, string | number | boolean> = {
          page,
          take,
          sortField,
          sortOrder,
          includeBatches,
        };
        if (searchField) params.searchField = searchField;
        const s = typeof search === 'string' ? search.trim() : '';
        if (s) params.search = s;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;

        return { url: 'sale', method: 'GET', params };
      },
      providesTags: ['SALE_BROWSE'],
    }),

    getSaleProduct: builder.query<
      SaleOneResponse,
      { productId: string; includeBatches?: boolean }
    >({
      query: ({ productId, includeBatches = true }) => ({
        url: 'sale/one',
        method: 'GET',
        params: { productId, includeBatches },
      }),
      providesTags: ['SALE_BROWSE'],
    }),

    getSales: builder.query<TransactionsListResponse, TransactionsQuery | void>(
      {
        query: (args) => {
          const {
            page = 1,
            take = 6,
            createdFrom,
            createdTo,
            q,
            clientId,
            productId,
            sortBy = 'createdAt',
            sortDir = 'DESC',
          } = args ?? {};

          const params: Record<string, string | number> = {
            page,
            take,
            sortBy,
            sortDir,
          };
          if (q) params.q = q;
          if (clientId) params.clientId = clientId;
          if (productId) params.productId = productId;
          if (createdFrom) params.createdFrom = createdFrom;
          if (createdTo) params.createdTo = createdTo;
          return { url: 'transaction', method: 'GET', params };
        },
        providesTags: ['SALES'],
      }
    ),

    getSaleById: builder.query<TransactionResult, string>({
      query: (id) => ({ url: `transaction/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'SALES' as const, id }],
    }),

    createSale: builder.mutation<TransactionResult, CreateSalePayload>({
      query: (body) => ({ url: 'transaction', method: 'POST', body }),
      invalidatesTags: [
        'SALES',
        'SALE_BROWSE',
        'STATISTICS',
        'CLIENTS',
        'PRODUCTS',
      ],
    }),

    revertTransaction: builder.mutation<TransactionResult, string>({
      query: (id) => ({ url: `transaction/${id}/revert`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [
        'SALES',
        'SALE_BROWSE',
        'STATISTICS',
        'CLIENTS',
        'PRODUCTS',
        'PRODUCT_LOGS',
        'PAYMENTS',
        'DEBTS',
        { type: 'SALES' as const, id },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSaleItemsQuery,
  useGetSaleProductQuery,
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useLazyGetSaleByIdQuery,
  useCreateSaleMutation,
  useRevertTransactionMutation,
} = salesApi;
