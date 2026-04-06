import { RecordService } from "../src/services/record.service";
import { ApiError } from "../src/utils/apiError";
import { RecordType } from "../src/utils/enums";

describe("RecordService", () => {
  const createRepository = () => ({
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    softDelete: jest.fn()
  });

  it("creates records and converts the date to a Date instance", async () => {
    const repository = createRepository();
    repository.create.mockResolvedValue({
      toJSON: () => ({
        id: "record-1",
        amount: 100,
        type: RecordType.Income
      })
    });

    const service = new RecordService(repository as never);

    await service.createRecord(
      {
        amount: 100,
        type: RecordType.Income,
        category: "Consulting",
        date: "2026-04-01T00:00:00.000Z"
      },
      "user-1"
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: "user-1",
        date: expect.any(Date)
      })
    );
  });

  it("returns paginated records", async () => {
    const repository = createRepository();
    repository.list.mockResolvedValue({
      items: [{ toJSON: () => ({ id: "record-1" }) }],
      total: 1
    });

    const service = new RecordService(repository as never);
    const result = await service.listRecords({ page: 1, limit: 10, type: RecordType.Income });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("throws not found when deleting a missing record", async () => {
    const repository = createRepository();
    repository.softDelete.mockResolvedValue(null);

    const service = new RecordService(repository as never);

    await expect(service.deleteRecord("missing-id", "admin-id")).rejects.toMatchObject({
      statusCode: 404,
      message: "Financial record not found"
    });
  });
});
