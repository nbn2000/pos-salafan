// src/api/raw-materials.ts
import { baseApi } from '@/api';
import type {
  CreateMaterialWithBatch,
  GetDefaultQuery,
  RawMaterialsListResponse,
  RawMaterialRefillItem,
} from '@/interfaces/raw-material/raw-materials';

export const rawMaterialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRawMaterials: builder.query<
      RawMaterialsListResponse,
      GetDefaultQuery | void
    >({
      query: (args) => {
        const {
          page = 1,
          take = 6,
          search,
          searchField = "name",
          sortField = 'createdAt',
          sortOrder = 'DESC',
          priority,
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
        
        if (priority) params.priority = priority;

        return {
          url: 'raw-material/with-batches',
          method: 'GET',
          params,
        };
      },
      providesTags: ['RAW_MATERIALS'],
    }),

    addRawMaterials: builder.mutation<any, { data: CreateMaterialWithBatch }>({
      query: ({ data }) => {
        const body = {
          name: data.name,
          type: data.type,
          priority: data.priority,
          batch: {
            amount: data.batch.amount,
            buyPrice: data.batch.buyPrice,
          },
          paid: data.paid || 0,
          supplierId: data.supplierId,
          paymentType: data.paymentType,
        };
        
        // Debug: Check what's being sent to backend
        console.log('🚀 API sending to backend:', body);
        console.log('🚀 Priority in API body:', body.priority);
        
        return {
          url: `raw-material`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['RAW_MATERIALS', 'STATISTICS'],
    }),

    updateRawMaterials: builder.mutation<
      any,
      { id: string; data: Partial<CreateMaterialWithBatch> }
    >({
      // NOTE: backend PATCH expects JSON for standard updates (no files).
      // If you later need file updates, convert to FormData similarly.
      query: ({ id, data }) => ({
        url: `raw-material/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['RAW_MATERIALS', 'STATISTICS'],
    }),

    deleteRawMaterials: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `raw-material/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RAW_MATERIALS', 'STATISTICS'],
    }),

    getRawMaterialsToFillStore: builder.query<RawMaterialRefillItem[], void>({
      query: () => ({
        url: 'raw-material/to-fill-store',
        method: 'GET',
      }),
      providesTags: ['RAW_MATERIALS'],
    }),
  }),
});

export const {
  useGetRawMaterialsQuery,
  useAddRawMaterialsMutation,
  useUpdateRawMaterialsMutation,
  useDeleteRawMaterialsMutation,
  useGetRawMaterialsToFillStoreQuery,
} = rawMaterialsApi;
