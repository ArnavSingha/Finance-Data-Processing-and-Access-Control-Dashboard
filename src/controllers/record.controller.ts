import { Request, Response } from "express";
import { RecordService } from "../services/record.service";
import { sendSuccess } from "../utils/apiResponse";

export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  createRecord = async (req: Request, res: Response) => {
    const result = await this.recordService.createRecord(req.body, req.user!.id);
    return sendSuccess(res, 201, "Record created successfully", result);
  };

  listRecords = async (req: Request, res: Response) => {
    const result = await this.recordService.listRecords(req.query);
    return sendSuccess(res, 200, "Records fetched successfully", result.items, result.meta);
  };

  getRecordById = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.recordService.getRecordById(id);
    return sendSuccess(res, 200, "Record fetched successfully", result);
  };

  updateRecord = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.recordService.updateRecord(id, req.body);
    return sendSuccess(res, 200, "Record updated successfully", result);
  };

  deleteRecord = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.recordService.deleteRecord(id, req.user!.id);
    return sendSuccess(res, 200, "Record deleted successfully", result);
  };
}
