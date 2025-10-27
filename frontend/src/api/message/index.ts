// src/api/message/index.ts
import { baseApi } from '@/api';

export interface GetMessagesArgs {
  page?: number;
  take?: number;
  q?: string;
  clientId?: string;
  createdFrom?: string; // optional, backend may ignore
  createdTo?: string; // optional
  sortBy?: 'createdAt' | 'toPhone' | 'status'; // ✅ fixed
  sortDir?: 'ASC' | 'DESC';
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE
    createMessage: builder.mutation<
      { success: boolean } | void,
      CreateMessagePayload
    >({
      query: (body) => ({
        url: 'messages', // kerak bo‘lsa moslang
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MESSAGES'],
    }),

    // LIST (GET)
    getMessages: builder.query<MessagesListResponse, GetMessagesArgs | void>({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          q,
          clientId = '',
          createdFrom,
          createdTo,
          sortBy = 'createdAt',
          sortDir = 'DESC',
        } = args ?? {};

        const params: Record<string, string> = {
          page: String(page),
          take: String(take),
          clientId,
          sortBy,
          sortDir,
        };
        if (q) params.search = q;
        if (clientId) params.clientId = clientId;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;

        return {
          url: 'messages',
          method: 'GET',
          params,
        };
      },
      providesTags: ['MESSAGES'],
    }),

    // GET BY ID
    getMessageById: builder.query<MessageItem, string>({
      query: (id) => ({
        url: `messages/${id}`,
        method: 'GET',
      }),
      providesTags: ['MESSAGES'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateMessageMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetMessageByIdQuery,
} = messagesApi;
