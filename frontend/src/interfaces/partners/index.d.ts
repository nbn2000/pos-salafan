// Partner bilan ishlash uchun typelar

declare interface CreatePartnerPayload {
  name: string;
  phone?: string;
}

declare type SortByPartner = 'name' | 'createdAt' | 'updatedAt';

declare type Partner = {
  id: string;
  name: string;
  phone: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

declare interface PaginatedRecipesResponse<T> {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
}

declare type PartnersListResponse = PaginatedRecipesResponse<Partner>;

declare type PartnerByIdResponse = Partner;
