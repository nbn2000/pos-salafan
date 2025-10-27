import { Injectable } from '@nestjs/common';
import { AnalyticsBaseService } from './analytics-base.service';

@Injectable()
export class AnalyticsSpendService extends AnalyticsBaseService {
  totalExpenses(_from: Date, _to: Date): Promise<number> {
    void _from;
    void _to;
    // Expense module removed; return 0
    return Promise.resolve(0);
  }
}
