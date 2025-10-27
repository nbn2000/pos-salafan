import { baseApi } from '@/api';
import { ILoginPost, IRegisterPost, IUserData, IUserUpdate } from './type';
import { setAuth } from '@/store/slices/authSlice';
import { AUTH } from '@/api/path';

export const authApiReq = baseApi.injectEndpoints({
  endpoints: ({ mutation, query }) => ({
    getUserData: query<IUserData, void>({
      query: () => ({
        url: '/auth/me/',
        method: 'GET',
      }),
      providesTags: ['AUTH'],
    }),

    register: mutation<any, IRegisterPost>({
      query: (body) => ({
        url: `${AUTH.REGISTER}`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { access, refresh } = data;

          dispatch(setAuth({ token: access, refreshToken: refresh }));
        } catch (err) {
          console.log('register error:', err);
        }
      },
    }),
    login: mutation<any, ILoginPost>({
      query: (body) => ({
        url: `${AUTH.LOGIN}`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { access_token, refresh_token } = data.auth;
          dispatch(
            setAuth({ token: access_token, refreshToken: refresh_token })
          );
        } catch (err) {
          console.log('login error:', err);
        }
      },
    }),

    updateUser: mutation({
      query: (data: IUserUpdate) => ({
        url: '/auth/update-profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AUTH'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useUpdateUserMutation,
  useLazyGetUserDataQuery,
} = authApiReq;
