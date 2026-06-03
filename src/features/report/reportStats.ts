import type { TestCase, TestResult, TestStatus } from "../../types/report";

export interface ReportStats {
  total: number;
  filled: number;
  unfilled: number;
  /** Completion rate as an integer percentage (0-100). */
  completionRate: number;
  tally: Record<TestStatus, number>;
}

/**
 * Compute completion stats for the report preview and the HTML report.
 * 已填寫 = a result exists for the case with a status other than not_tested.
 */
export function computeReportStats(
  testCases: TestCase[],
  results: Record<string, TestResult>,
): ReportStats {
  const tally: Record<TestStatus, number> = {
    pass: 0,
    fail: 0,
    blocked: 0,
    need_confirm: 0,
    not_tested: 0,
  };

  let filled = 0;
  for (const testCase of testCases) {
    const result = results[testCase.id];
    const status = result?.status ?? "not_tested";
    tally[status] += 1;
    if (result != null && result.status !== "not_tested") {
      filled += 1;
    }
  }

  const total = testCases.length;
  const unfilled = total - filled;
  const completionRate = total > 0 ? Math.round((filled / total) * 100) : 0;

  return { total, filled, unfilled, completionRate, tally };
}
