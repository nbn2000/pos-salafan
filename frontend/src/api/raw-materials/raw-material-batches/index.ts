// api/partners.ts
import { baseApi } from '@/api';
import {
  CreateRawMaterialBatchPayload,
  UpdateRawMaterialBatchPayload,
  RawMaterialBatchesListResponse,
} from '@/interfaces/raw-material/raw-materials';

export type ListBatchesQuery = {
  id: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

export const rawMaterialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRawMaterialsBatches: builder.query<
      RawMaterialBatchesListResponse,
      ListBatchesQuery | void
    >({
      query: (args) => {
        const {
          id,
          page = 1,
          limit = 6,
          search,
          sortBy = 'createdAt',
          sortOrder = 'DESC',
        } = args ?? {};

        const params: Record<string, string | number> = {
          page,
          limit,
          sortBy,
          sortOrder,
        };

        const s = typeof search === 'string' ? search.trim() : '';
        if (s !== '') {
          params.search = s;
        }

        return {
          url: `raw-material-batch/raw/${id}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['RAW_MATERIALS', 'RAW_MATERIAL_PARTY'],
    }),
    addRawMaterialBatch: builder.mutation<
      any,
      { rawMaterialId: string; data: CreateRawMaterialBatchPayload }
    >({
      query: ({ rawMaterialId, data }) => ({
        url: `raw-material-batch/${rawMaterialId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RAW_MATERIALS', 'RAW_MATERIAL_PARTY', 'STATISTICS'],
    }),

    updateRawMaterialBatch: builder.mutation<
      any,
      {
        id: number | string;
        rawMaterialId: string;
        data: UpdateRawMaterialBatchPayload;
      }
    >({
      query: ({ id, rawMaterialId, data }) => ({
        url: `raw-material-batch/${id}/${rawMaterialId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['RAW_MATERIALS', 'RAW_MATERIAL_PARTY', 'STATISTICS'],
    }),

    deleteRawMaterialBatch: builder.mutation<
      { success: boolean },
      number | string
    >({
      query: (id) => ({
        url: `raw-material-batch/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RAW_MATERIALS', 'RAW_MATERIAL_PARTY', 'STATISTICS'],
    }),
  }),
});

export const {
  useGetRawMaterialsBatchesQuery,
  useAddRawMaterialBatchMutation,
  useUpdateRawMaterialBatchMutation,
  useDeleteRawMaterialBatchMutation,
} = rawMaterialsApi;

