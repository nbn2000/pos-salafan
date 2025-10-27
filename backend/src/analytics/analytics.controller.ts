import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsBaseQueryDto } from './dto/analytics-range.dto';
import { AnalyticsService } from './services/analytics.service';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('kpis')
  @ApiResponse({
    status: 200,
    description:
      'KPIs: stock by type (raw KG/UNIT and product KG/UNIT), totalProfit (sum over sold items of amount * (price - cost)).',
  })
  kpis(@Query() query: AnalyticsBaseQueryDto) {
    return this.service.kpis(query);
  }
}

