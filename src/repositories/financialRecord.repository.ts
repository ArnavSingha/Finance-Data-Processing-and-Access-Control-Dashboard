import { FilterQuery, PipelineStage, Types } from "mongoose";
import { FinancialRecordModel } from "../models/financialRecord.model";
import { RecordType } from "../utils/enums";

type RecordFilters = {
  type?: RecordType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
};

type RecordListOptions = RecordFilters & {
  skip: number;
  limit: number;
};

type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: RecordType;
};

const buildActiveRecordFilter = ({
  type,
  category,
  dateFrom,
  dateTo
}: RecordFilters): FilterQuery<typeof FinancialRecordModel> => {
  const filter: FilterQuery<typeof FinancialRecordModel> = {
    deletedAt: null
  };

  if (type) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (dateFrom || dateTo) {
    filter.date = {};

    if (dateFrom) {
      filter.date.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      filter.date.$lte = new Date(dateTo);
    }
  }

  return filter;
};

const buildDashboardMatch = ({ dateFrom, dateTo, type }: DashboardFilters): PipelineStage.Match["$match"] => {
  const match: PipelineStage.Match["$match"] = {
    deletedAt: null
  };

  if (type) {
    match.type = type;
  }

  if (dateFrom || dateTo) {
    match.date = {};

    if (dateFrom) {
      match.date.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      match.date.$lte = new Date(dateTo);
    }
  }

  return match;
};

export class FinancialRecordRepository {
  async create(payload: {
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
    notes?: string;
    createdBy: string;
  }) {
    return FinancialRecordModel.create({
      ...payload,
      createdBy: new Types.ObjectId(payload.createdBy)
    });
  }

  async list({ skip, limit, ...filters }: RecordListOptions) {
    const query = buildActiveRecordFilter(filters);

    const [items, total] = await Promise.all([
      FinancialRecordModel.find(query)
        .populate("createdBy", "name email role")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FinancialRecordModel.countDocuments(query)
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return FinancialRecordModel.findOne({ _id: id, deletedAt: null }).populate(
      "createdBy",
      "name email role"
    );
  }

  async updateById(
    id: string,
    payload: Partial<{
      amount: number;
      type: RecordType;
      category: string;
      date: Date;
      notes?: string;
    }>
  ) {
    return FinancialRecordModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      payload,
      { new: true }
    ).populate("createdBy", "name email role");
  }

  async softDelete(id: string, deletedBy: string) {
    return FinancialRecordModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(deletedBy)
      },
      { new: true }
    );
  }

  async getSummary(filters: DashboardFilters) {
    const results = await FinancialRecordModel.aggregate([
      { $match: buildDashboardMatch(filters) },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", RecordType.Income] }, "$amount", 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", RecordType.Expense] }, "$amount", 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] }
        }
      }
    ]);

    return (
      results[0] ?? {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0
      }
    );
  }

  async getCategoryBreakdown(filters: DashboardFilters) {
    return FinancialRecordModel.aggregate([
      { $match: buildDashboardMatch(filters) },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category"
          },
          totalAmount: { $sum: "$amount" },
          recordCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          category: "$_id.category",
          totalAmount: 1,
          recordCount: 1
        }
      },
      { $sort: { totalAmount: -1, category: 1 } }
    ]);
  }

  async getTrends(filters: DashboardFilters) {
    return FinancialRecordModel.aggregate([
      { $match: buildDashboardMatch(filters) },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalAmount: { $sum: "$amount" },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          year: "$_id.year",
          month: "$_id.month",
          totalAmount: 1,
          recordCount: 1
        }
      }
    ]);
  }
}
