import { baseApi } from '@/api';

export const debtsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<void, CreatePaymentPayload>({
      query: (data) => ({
        url: 'payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DEBTS', 'SALES', 'STATISTICS', 'CLIENTS', 'SUPPLIERS'],
    }),

    createDebt: builder.mutation<Debt, DebtPayload>({
      query: (body) => ({
        url: 'debt',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DEBTS', 'CLIENTS', 'SUPPLIERS', 'STATISTICS'],
    }),
  }),
});

export const { useCreatePaymentMutation, useCreateDebtMutation } = debtsApi;
