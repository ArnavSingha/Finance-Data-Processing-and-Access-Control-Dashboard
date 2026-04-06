import { FinancialRecordRepository } from "../repositories/financialRecord.repository";
import { ApiError } from "../utils/apiError";
import { RecordType } from "../utils/enums";
import { normalizePagination } from "../utils/pagination";

type RecordFilters = {
  page?: number;
  limit?: number;
  type?: RecordType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
};

type CreateRecordPayload = {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
};

type UpdateRecordPayload = Partial<CreateRecordPayload>;

export class RecordService {
  constructor(private readonly financialRecordRepository: FinancialRecordRepository) {}

  async createRecord(payload: CreateRecordPayload, userId: string) {
    const record = await this.financialRecordRepository.create({
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      date: new Date(payload.date),
      notes: payload.notes,
      createdBy: userId
    });

    return record.toJSON();
  }

  async listRecords(filters: RecordFilters) {
    const pagination = normalizePagination(filters.page, filters.limit);
    const { items, total } = await this.financialRecordRepository.list({
      ...filters,
      skip: pagination.skip,
      limit: pagination.limit
    });

    return {
      items: items.map((item) => item.toJSON()),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1
      }
    };
  }

  async getRecordById(id: string) {
    const record = await this.financialRecordRepository.findById(id);

    if (!record) {
      throw new ApiError(404, "Financial record not found");
    }

    return record.toJSON();
  }

  async updateRecord(id: string, payload: UpdateRecordPayload) {
    const updatePayload: Partial<{
      amount: number;
      type: RecordType;
      category: string;
      date: Date;
      notes?: string;
    }> = {
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
      ...(payload.date !== undefined ? { date: new Date(payload.date) } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {})
    };

    const record = await this.financialRecordRepository.updateById(id, updatePayload);

    if (!record) {
      throw new ApiError(404, "Financial record not found");
    }

    return record.toJSON();
  }

  async deleteRecord(id: string, deletedBy: string) {
    const record = await this.financialRecordRepository.softDelete(id, deletedBy);

    if (!record) {
      throw new ApiError(404, "Financial record not found");
    }

    return { id, deletedAt: record.deletedAt };
  }
}
