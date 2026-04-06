import { FinancialRecordRepository } from "../repositories/financialRecord.repository";
import { RecordType } from "../utils/enums";

type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: RecordType;
};

export class DashboardService {
  constructor(private readonly financialRecordRepository: FinancialRecordRepository) {}

  async getSummary(filters: Omit<DashboardFilters, "type">) {
    return this.financialRecordRepository.getSummary(filters);
  }

  async getCategoryBreakdown(filters: DashboardFilters) {
    return this.financialRecordRepository.getCategoryBreakdown(filters);
  }

  async getTrends(filters: DashboardFilters) {
    return this.financialRecordRepository.getTrends(filters);
  }
}

