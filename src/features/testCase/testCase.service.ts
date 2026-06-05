import dayjs from "dayjs";
import type { TestCase, TestCaseMeta } from "../../types/report";
import {
  parseTestCasesCsv,
  type ParseTestCasesCsvOptions,
} from "./parseTestCasesCsv";

export interface FetchTestCasesResult {
  testCases: TestCase[];
  meta: TestCaseMeta;
}

/**
 * Fetch and parse a project's test-cases CSV.
 * Path is resolved against import.meta.env.BASE_URL so it works on both
 * local dev (/) and a GitHub Pages subpath.
 */
export async function fetchTestCases(
  csvPath: string,
  options?: ParseTestCasesCsvOptions,
): Promise<FetchTestCasesResult> {
  const url = `${import.meta.env.BASE_URL}${csvPath}`;

  let res: Response;
  try {
    // no-store so editing the CSV is picked up on reload (no stale browser cache).
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new Error(`无法读取测试案例 CSV（路径：${url}）`);
  }
  if (!res.ok) {
    throw new Error(`无法读取测试案例 CSV（路径：${url}，HTTP ${res.status}）`);
  }

  const text = await res.text();

  let testCases: TestCase[];
  try {
    testCases = parseTestCasesCsv(text, options);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CSV 解析失败";
    throw new Error(`${message}（路径：${url}）`, { cause: err });
  }

  const meta: TestCaseMeta = {
    sourceName: csvPath,
    loadedAt: dayjs().format("YYYY-MM-DD HH:mm"),
    totalCases: testCases.length,
  };

  return { testCases, meta };
}
