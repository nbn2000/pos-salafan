import { baseApi } from '@/api';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<
      PaginationResult<Payment>,
      PaginationQuery | void
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
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;

        return { url: 'payment', method: 'GET', params };
      },
      providesTags: ['PAYMENTS'],
    }),

    // Get one payment
    getPayment: builder.query<Payment, string>({
      query: (id) => `payment/${id}`,
      providesTags: ['PAYMENTS'],
    }),

    // Create payment
    createPayment: builder.mutation<Payment, PaymentPayload>({
      query: (body) => ({
        url: 'payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'PAYMENTS',
        'DEBTS',
        'CLIENTS',
        'SUPPLIERS',
        'STATISTICS',
      ],
    }),

    // Update payment
    updatePayment: builder.mutation<
      Payment,
      { id: string; body: Partial<PaymentPayload> }
    >({
      query: ({ id, body }) => ({
        url: `payment/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        'PAYMENTS',
        'DEBTS',
        'CLIENTS',
        'SUPPLIERS',
        'STATISTICS',
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} = paymentsApi;
