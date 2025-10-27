// api/partners.ts
import { baseApi } from '@/api';

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<PartnersListResponse, PaginationQuery | void>({
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
        if (s !== '') {
          params.search = s; // faqat bo‘sh bo‘lmasa qo‘shamiz
        }

        return {
          url: 'supplier',
          method: 'GET',
          params, // RTK Query undefined keylarni yubormaydi; biz umuman qo‘shmayapmiz
        };
      },
      providesTags: ['SUPPLIERS'],
    }),

    getPartnersFinance: builder.query<SupplierMaterialsFinance, string | void>({
      query: (id) => {
        return {
          url: `supplier/${id}/raw-materials-finance`,
          method: 'GET',
        };
      },
      providesTags: ['SUPPLIERS'],
    }),

    addPartners: builder.mutation<any, Partial<CreatePartnerPayload>>({
      query: (body) => ({
        url: 'supplier',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),

    updatePartners: builder.mutation<
      any,
      { id: number | string; data: Partial<CreatePartnerPayload> }
    >({
      query: ({ id, data }) => ({
        url: `supplier/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),

    deletePartners: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: `supplier/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnersFinanceQuery,
  useAddPartnersMutation,
  useUpdatePartnersMutation,
  useDeletePartnersMutation,
} = partnersApi;
