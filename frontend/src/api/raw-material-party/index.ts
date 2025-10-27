import { baseApi } from '@/api';

export const rawMaterialPartiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /raw-materials/:rawMaterialId/parties
    getRawMaterialParties: build.query<
      ListPartiesRes,
      { rawMaterialId: UUID } & ListPartiesQuery
    >({
      query: ({ rawMaterialId, page = 1, limit = 6 }) => ({
        url: `/raw-materials/${rawMaterialId}/parties`,
        params: { page, limit },
      }),
      providesTags: ['RAW_MATERIAL_PARTY', 'RAW_MATERIALS'],
    }),

    // POST /raw-materials/:rawMaterialId/parties
    createRawMaterialParty: build.mutation<
      RawMaterialParty,
      { rawMaterialId: UUID; body: CreateRawMaterialPartyReq }
    >({
      query: ({ rawMaterialId, body }) => ({
        url: `/raw-materials/${rawMaterialId}/parties`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RAW_MATERIAL_PARTY', 'RAW_MATERIALS', 'STATISTICS'],
    }),

    // PATCH /raw-materials/:rawMaterialId/parties/:partyId
    updateRawMaterialParty: build.mutation<
      RawMaterialParty,
      { rawMaterialId: UUID; partyId: UUID; body: UpdateRawMaterialPartyReq }
    >({
      query: ({ rawMaterialId, partyId, body }) => ({
        url: `/raw-materials/${rawMaterialId}/parties/${partyId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['RAW_MATERIAL_PARTY', 'RAW_MATERIALS', 'STATISTICS'],
    }),

    deleteRawMaterialParty: build.mutation<
      { message: string; partyId: UUID },
      { rawMaterialId: UUID; partyId: UUID }
    >({
      query: ({ rawMaterialId, partyId }) => ({
        url: `/raw-materials/${rawMaterialId}/parties/${partyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RAW_MATERIAL_PARTY', 'RAW_MATERIALS', 'STATISTICS'],
    }),
  }),
});

export const {
  useGetRawMaterialPartiesQuery,
  useCreateRawMaterialPartyMutation,
  useUpdateRawMaterialPartyMutation,
  useDeleteRawMaterialPartyMutation,
} = rawMaterialPartiesApi;

