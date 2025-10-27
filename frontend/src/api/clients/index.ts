import { baseApi } from '@/api';

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<PaginationResult<Client>, PaginationQuery | void>(
      {
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

          return { url: 'client', method: 'GET', params };
        },
        providesTags: ['CLIENTS'],
      }
    ),

    getDebtors: builder.query<
      PaginationResult<ClientFinanceRow>,
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

        return { url: 'client/finance/debts', method: 'GET', params };
      },
      providesTags: ['CLIENTS'],
    }),

    getClientFinance: builder.query<ClientFinanceRow, string>({
      query: (id) => ({
        url: `client/${id}/products-finance`,
        method: 'GET',
      }),
      providesTags: ['CLIENTS'],
    }),

    addClient: builder.mutation<Client, CreateClientPayload>({
      query: (body) => ({
        url: 'client',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CLIENTS'],
    }),

    updateClient: builder.mutation<
      Client,
      { id: string; data: Partial<CreateClientPayload> }
    >({
      query: ({ id, data }) => ({
        url: `client/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['CLIENTS'],
    }),

    deleteClient: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `client/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CLIENTS'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetDebtorsQuery,
  useGetClientFinanceQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi;
