import { baseApi } from '@/api';

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all suppliers (paginated)
    getSuppliers: builder.query<
      PaginationResult<Supplier>,
      PaginationQuery | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = 'name',
          sortField = 'createdAt',
          sortOrder = 'DESC',
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          take,
          searchField,
          sortField,
          sortOrder,
        };

        const s = typeof search === 'string' ? search.trim() : '';
        if (s !== '') params.search = s;

        return { url: 'supplier', method: 'GET', params };
      },
      providesTags: ['SUPPLIERS'],
    }),

    // Get all suppliers with raw-material debts
    getSupplierDebtors: builder.query<
      PaginationResult<SupplierFinanceRow>,
      PaginationQuery | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = 'name',
          sortField = 'createdAt',
          sortOrder = 'DESC',
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          take,
          searchField,
          sortField,
          sortOrder,
        };

        const s = typeof search === 'string' ? search.trim() : '';
        if (s !== '') params.search = s;

        return { url: 'supplier/raw-materials-finance', method: 'GET', params };
      },
      providesTags: ['SUPPLIERS'],
    }),

    // Get raw-material finance for single supplier
    getSupplierFinance: builder.query<SupplierFinanceRow, string>({
      query: (id) => ({
        url: `supplier/${id}/raw-materials-finance`,
        method: 'GET',
      }),
      providesTags: ['SUPPLIERS'],
    }),

    // CRUD operations
    addSupplier: builder.mutation<Supplier, CreateSupplierPayload>({
      query: (body) => ({
        url: 'supplier',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),

    updateSupplier: builder.mutation<
      Supplier,
      { id: string; data: Partial<CreateSupplierPayload> }
    >({
      query: ({ id, data }) => ({
        url: `supplier/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),

    deleteSupplier: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `supplier/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierDebtorsQuery,
  useGetSupplierFinanceQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
