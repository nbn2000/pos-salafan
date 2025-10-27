// src/api/products.ts
import { baseApi } from '@/api';

type ProductsListResponse = PaginatedProductsResponse<ProductWithBatches>;
type ProductByIdResponse = ProductWithBatches;

// ==== Helpers ====
function buildBody(data: Partial<CreateProductPayload>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'images' && Array.isArray(v)) {
      v.forEach((file) => {
        if (file instanceof File) fd.append('images', file);
      });
    } else {
      fd.append(k, String(v));
    }
  });
  return { body: fd };
}

// ==== API slice ====
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsListResponse, (PaginationQuery & { priority?: Priority }) | void>({
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
          priority,
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
        if (priority) params.priority = priority;

        return { url: 'product', method: 'GET', params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map((p) => ({
                type: 'PRODUCTS' as const,
                id: p.id,
              })),
              { type: 'PRODUCTS' as const, id: 'LIST' },
            ]
          : [{ type: 'PRODUCTS' as const, id: 'LIST' }],
    }),

    getProductById: builder.query<ProductByIdResponse, string>({
      query: (id) => ({ url: `product/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'PRODUCTS', id }],
    }),

    addProduct: builder.mutation<ProductWithBatches, CreateProductPayload>({
      query: (data) => {
        const { body } = buildBody(data);
        return { url: 'product', method: 'POST', body };
      },
      invalidatesTags: [
        { type: 'PRODUCTS', id: 'LIST' },
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),

    updateProduct: builder.mutation<
      ProductWithBatches,
      { id: string; data: Partial<CreateProductPayload> }
    >({
      query: ({ id, data }) => {
        const body = Object.fromEntries(
          Object.entries(data).filter(([, value]) =>
            value !== undefined && value !== null
          ),
        );
        return { url: `product/${id}`, method: 'PATCH', body };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'PRODUCTS', id },
        { type: 'PRODUCTS', id: 'LIST' },
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),

    deleteProduct: builder.mutation<{ success: boolean } | void, string>({
      query: (id) => ({ url: `product/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'PRODUCTS', id },
        { type: 'PRODUCTS', id: 'LIST' },
        'SALE_BROWSE',
        'STATISTICS',
      ],
    }),

    getProductsToFillStore: builder.query<ProductRefillItem[], void>({
      query: () => ({
        url: 'product/find-to-fill-store',
        method: 'GET',
      }),
      providesTags: ['PRODUCTS'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsToFillStoreQuery,
} = productsApi;
