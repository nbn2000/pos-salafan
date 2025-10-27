import { baseApi } from '@/api';

export type GroupBy = 'day' | 'week' | 'month';

export interface GetStatisticsArgs {
  createdFrom?: string;
  createdTo?: string;
  groupBy?: GroupBy;
  onlyProducts?: boolean;
  onlyRawMaterials?: boolean;
}

export const statisticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatistics: builder.query<
      FinanceOverviewResponse,
      GetStatisticsArgs | void
    >({
      query: (args) => {
        const {
          createdFrom,
          createdTo,
          groupBy,
          onlyProducts,
          onlyRawMaterials,
        } = args ?? {};

        const params: Record<string, string> = {};
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (groupBy) params.groupBy = groupBy;

        if (typeof onlyProducts === 'boolean') {
          params.onlyProducts = String(onlyProducts);
        }
        if (typeof onlyRawMaterials === 'boolean') {
          params.onlyRawMaterials = String(onlyRawMaterials);
        }

        return {
          url: 'analytics/kpis',
          method: 'GET',
          params,
        };
      },
      providesTags: ['STATISTICS'],
    }),
    getKPIs: builder.query<KPIsResponse, GetStatisticsArgs | void>({
      query: (args) => {
        const {
          createdFrom,
          createdTo,
          groupBy,
          onlyProducts,
          onlyRawMaterials,
        } = args ?? {};

        const params: Record<string, string> = {};
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        if (groupBy) params.groupBy = groupBy;

        if (typeof onlyProducts === 'boolean') {
          params.onlyProducts = String(onlyProducts);
        }
        if (typeof onlyRawMaterials === 'boolean') {
          params.onlyRawMaterials = String(onlyRawMaterials);
        }

        return {
          url: 'analytics/kpis',
          method: 'GET',
          params,
        };
      },
      providesTags: ['STATISTICS'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetStatisticsQuery, useLazyGetStatisticsQuery, useGetKPIsQuery, useLazyGetKPIsQuery } =
  statisticsApi;
