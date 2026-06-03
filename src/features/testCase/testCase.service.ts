import type { TestCase } from "../../types/report";
import { parseTestCasesCsv } from "./parseTestCasesCsv";

/**
 * Fetch and parse the test cases CSV.
 * Path is resolved against import.meta.env.BASE_URL so it works on both
 * local dev (/) and a GitHub Pages subpath.
 */
export async function fetchTestCases(): Promise<TestCase[]> {
  const url = `${import.meta.env.BASE_URL}data/test-cases.csv`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`无法读取测试案例 CSV (HTTP ${res.status})`);
  }
  const text = await res.text();
  return parseTestCasesCsv(text);
}
