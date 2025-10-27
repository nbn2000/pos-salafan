import { ApiProperty } from '@nestjs/swagger';

// ---- leaf minis ----
export class ClientMiniDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() phone: string;
}

export class ProductMiniViewDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class RawMaterialMiniViewDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

// ---- line views ----
export class ClientProductLineFinanceViewDto {
  @ApiProperty() transactionId: string;
  @ApiProperty() amount: number;
  @ApiProperty() soldPrice: number;
  @ApiProperty() total: number;
  @ApiProperty() paid: number;
  @ApiProperty() due: number;
  @ApiProperty() debt: number;
}

export class ClientRawLineFinanceViewDto {
  @ApiProperty() transactionId: string;
  @ApiProperty() amount: number;
  @ApiProperty() soldPrice: number;
  @ApiProperty() total: number;
  @ApiProperty() paid: number;
  @ApiProperty() due: number;
  @ApiProperty() debt: number;
}

// ---- grouped items ----
export class ClientProductFinanceItemDto {
  @ApiProperty({ type: () => ProductMiniViewDto })
  product: ProductMiniViewDto;

  @ApiProperty()
  credit: number;

  @ApiProperty({ type: () => [ClientProductLineFinanceViewDto] })
  lines: ClientProductLineFinanceViewDto[];
}

export class ClientRawFinanceItemDto {
  @ApiProperty({ type: () => RawMaterialMiniViewDto })
  rawMaterial: RawMaterialMiniViewDto;

  @ApiProperty()
  credit: number;

  @ApiProperty({ type: () => [ClientRawLineFinanceViewDto] })
  lines: ClientRawLineFinanceViewDto[];
}

// ---- one row per client ----
export class ClientProductsFinanceRowDto {
  @ApiProperty({ type: () => ClientMiniDto })
  client: ClientMiniDto;

  @ApiProperty()
  credit: number;

  @ApiProperty({ type: () => [ClientProductFinanceItemDto] })
  items: ClientProductFinanceItemDto[];

  @ApiProperty({ type: () => [ClientRawFinanceItemDto] })
  rawItems: ClientRawFinanceItemDto[];
}

// ---- paginated wrapper ----
export class ClientsProductsFinancePagedDto {
  @ApiProperty() count: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() page: number;
  @ApiProperty() take: number;

  @ApiProperty({ type: () => [ClientProductsFinanceRowDto] })
  results: ClientProductsFinanceRowDto[];
}
