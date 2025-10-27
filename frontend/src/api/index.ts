import { logout, setAuth } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AUTH } from './path';

const url = import.meta.env.VITE_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: `${url}`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as any).auth.refreshToken;

    const refreshResult: any = await baseQuery(
      {
        url: AUTH.REFRESH,
        method: 'POST',
        body: {
          refresh: refreshToken,
        },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data?.access && refreshResult?.data?.refresh) {
      api.dispatch(
        setAuth({
          token: refreshResult.data.access,
          refreshToken: refreshResult.data.refresh,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
      api.dispatch(clearCart());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'AUTH',
    'PRODUCTS',
    'SALES',
    'SUPPLIERS',
    'CLIENTS',
    'DEBTS',
    'EMPLOYEES',
    'MERCHANT_DEBTS',
    'STATISTICS',
    'LOGS',
    'PARTNERS',
    'RAW_MATERIALS',
    'RAW_MATERIAL_PARTY',
    'EMPLOYEE_PAYMENTS',
    'PRODUCT_BATCHES',
    'MEASUREMENT',
    'MESSAGES',
    'RAW_MATERIAL_LOG',
    'PAYMENTS',
    'PRODUCT_LOGS',
    'SALE_BROWSE',
  ],
  keepUnusedDataFor: 30, // 30 soniya
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
