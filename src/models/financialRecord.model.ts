import { HydratedDocument, Schema, Types, model } from "mongoose";
import { RecordType } from "../utils/enums";

export interface IFinancialRecord {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string | null;
  createdBy: Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FinancialRecordDocument = HydratedDocument<IFinancialRecord>;

const financialRecordSchema = new Schema<IFinancialRecord>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    type: {
      type: String,
      enum: Object.values(RecordType),
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const output = ret as Record<string, unknown>;
        output.id = (ret._id as { toString(): string }).toString();
        delete output._id;
        return ret;
      }
    }
  }
);

financialRecordSchema.index({ createdBy: 1 });
financialRecordSchema.index({ type: 1, category: 1 });
financialRecordSchema.index({ date: 1 });
financialRecordSchema.index({ deletedAt: 1 });

export const FinancialRecordModel = model<IFinancialRecord>(
  "FinancialRecord",
  financialRecordSchema
);
