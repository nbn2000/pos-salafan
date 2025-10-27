import { baseApi } from '../index';

export interface CreateMessageDto {
  clientIds: string[];
  message: string;
}

export interface MessageDto {
  id: string;
  message: string;
  clientId: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface MessageQueryDto {
  page?: number;
  take?: number;
  search?: string;
  clientId?: string;
}

export interface MessagePagedResultDto {
  results: MessageDto[];
  count: number;
  totalPages: number;
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<MessageDto[], CreateMessageDto>({
      query: (dto) => ({
        url: '/messages',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['MESSAGES'],
    }),
    getMessages: builder.query<MessagePagedResultDto, MessageQueryDto>({
      query: (params) => ({
        url: '/api/messages',
        params,
      }),
      providesTags: ['MESSAGES'],
    }),
    getMessage: builder.query<MessageDto, string>({
      query: (id) => `/api/messages/${id}`,
      providesTags: (result, error, id) => [{ type: 'MESSAGES', id }],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetMessageQuery,
} = messagesApi;
