import { DashboardService } from "../src/services/dashboard.service";
import { RecordType } from "../src/utils/enums";

describe("DashboardService", () => {
  it("returns dashboard summary data from the repository", async () => {
    const repository = {
      getSummary: jest.fn().mockResolvedValue({
        totalIncome: 1200,
        totalExpenses: 300,
        netBalance: 900
      }),
      getCategoryBreakdown: jest.fn(),
      getTrends: jest.fn()
    };

    const service = new DashboardService(repository as never);
    const result = await service.getSummary({
      dateFrom: "2026-01-01T00:00:00.000Z",
      dateTo: "2026-02-28T23:59:59.000Z"
    });

    expect(result.netBalance).toBe(900);
  });

  it("passes category and trend filters through to the repository", async () => {
    const repository = {
      getSummary: jest.fn(),
      getCategoryBreakdown: jest.fn().mockResolvedValue([]),
      getTrends: jest.fn().mockResolvedValue([])
    };

    const service = new DashboardService(repository as never);

    await service.getCategoryBreakdown({ type: RecordType.Expense });
    await service.getTrends({ type: RecordType.Income });

    expect(repository.getCategoryBreakdown).toHaveBeenCalledWith({ type: RecordType.Expense });
    expect(repository.getTrends).toHaveBeenCalledWith({ type: RecordType.Income });
  });
});

