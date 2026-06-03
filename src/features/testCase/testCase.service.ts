import dayjs from "dayjs";
import type { TestCase, TestCaseMeta } from "../../types/report";
import { parseTestCasesCsv } from "./parseTestCasesCsv";

const SOURCE_NAME = "test-cases.csv";

export interface FetchTestCasesResult {
  testCases: TestCase[];
  meta: TestCaseMeta;
}

/**
 * Fetch and parse the test cases CSV.
 * Path is resolved against import.meta.env.BASE_URL so it works on both
 * local dev (/) and a GitHub Pages subpath.
 */
export async function fetchTestCases(): Promise<FetchTestCasesResult> {
  const url = `${import.meta.env.BASE_URL}data/${SOURCE_NAME}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(`无法读取测试案例 CSV（路径：${url}）`);
  }
  if (!res.ok) {
    throw new Error(`无法读取测试案例 CSV（路径：${url}，HTTP ${res.status}）`);
  }

  const text = await res.text();

  let testCases: TestCase[];
  try {
    testCases = parseTestCasesCsv(text);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CSV 解析失败";
    throw new Error(`${message}（路径：${url}）`, { cause: err });
  }

  const meta: TestCaseMeta = {
    sourceName: SOURCE_NAME,
    loadedAt: dayjs().format("YYYY-MM-DD HH:mm"),
    totalCases: testCases.length,
  };

  return { testCases, meta };
}
