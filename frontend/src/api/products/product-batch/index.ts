// src/api/product-batch.ts
import { baseApi } from '@/api';

export type ProductBatchesListResponse =
  PaginatedProductBatchesResponse<ProductBatch>;

// ==== API slice ====
export const productBatchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductBatchesByProduct: builder.query<
      ProductBatchesListResponse,
      { productId: string } & PaginationQuery
    >({
      query: ({ productId, ...query }) => {
        const params: Record<string, string | number> = {
          page: query.page ?? 1,
          take: query.take ?? 10,
          sortField: query.sortField ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'DESC',
        };
        if (query.search?.trim()) params.search = query.search.trim();

        return {
          url: `product-batch/product/${productId}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['PRODUCTS', 'PRODUCT_BATCHES'],
    }),

    addProductBatch: builder.mutation<ProductBatch, CreateProductBatchPayload>({
      query: (body) => ({
        url: `product-batch`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'PRODUCTS',
        'PRODUCT_BATCHES',
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),

    updateProductBatch: builder.mutation<
      ProductBatch,
      { id: string; data: UpdateProductBatchPayload }
    >({
      query: ({ id, data }) => ({
        url: `product-batch/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [
        'PRODUCTS',
        'PRODUCT_BATCHES',
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),

    deleteProductBatch: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `product-batch/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'PRODUCTS',
        'PRODUCT_BATCHES',
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),
  }),
});

export const {
  useGetProductBatchesByProductQuery,
  useAddProductBatchMutation,
  useUpdateProductBatchMutation,
  useDeleteProductBatchMutation,
} = productBatchesApi;

