import Papa from "papaparse";
import type { TestCase } from "../../types/report";

/** Header label for the test-case header row (column 0). */
const HEADER_CATEGORY = "类别";
const HEADER_ITEM = "项目";
const HEADER_REQUIREMENT = "测试规范与要求 Requirement";
const HEADER_STEPS = "测试步骤与预期 Test Steps & Expection";
const HEADER_NOTE = "NOTE";

/** Rows containing any of these phrases are skipped (instructional / non-case rows). */
const SKIP_PHRASES = [
  "测试前，请先确认",
  "提供测试录影",
  "提供本次测试的 .har",
];

/** Trigger words that mark a case as needing a screenshot. */
const SCREENSHOT_HINTS = ["截图", "截圖", "screenshot"];

function cell(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return "";
  return (row[index] ?? "").trim();
}

function isBlankRow(row: string[]): boolean {
  return row.every((c) => (c ?? "").trim() === "");
}

function containsSkipPhrase(row: string[]): boolean {
  return row.some((c) =>
    SKIP_PHRASES.some((phrase) => (c ?? "").includes(phrase)),
  );
}

function needsScreenshot(...parts: string[]): boolean {
  const haystack = parts.join("\n").toLowerCase();
  return SCREENSHOT_HINTS.some((hint) => haystack.includes(hint.toLowerCase()));
}

/**
 * Find the column index whose trimmed header text matches `label`.
 * Returns `fallback` when not found.
 */
function headerIndex(header: string[], label: string, fallback: number): number {
  const idx = header.findIndex((c) => (c ?? "").trim() === label);
  return idx >= 0 ? idx : fallback;
}

/**
 * Parse the Google-Sheet-exported CSV into TestCase[].
 *
 * The CSV is not one-row-per-case: there is preamble before the real header.
 * We locate the header row (row[0] === "类别"), then read the rows after it,
 * carrying forward blank 类别 / 项目 values from the previous non-blank row.
 */
export function parseTestCasesCsv(csvText: string): TestCase[] {
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: false,
  });
  const rows = parsed.data;

  const headerRowIndex = rows.findIndex(
    (row) => Array.isArray(row) && (row[0] ?? "").trim() === HEADER_CATEGORY,
  );
  if (headerRowIndex === -1) {
    throw new Error("未找到「类别」表头，请确认 CSV 格式是否正确");
  }

  const header = rows[headerRowIndex];
  const colCategory = headerIndex(header, HEADER_CATEGORY, 0);
  const colItem = headerIndex(header, HEADER_ITEM, 1);
  const colRequirement = headerIndex(header, HEADER_REQUIREMENT, 2);
  const colSteps = headerIndex(header, HEADER_STEPS, 3);
  const colNote = headerIndex(header, HEADER_NOTE, -1);

  const cases: TestCase[] = [];
  let lastCategory = "";
  let lastItem = "";
  let lastRequirement = "";
  let seq = 0;

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || isBlankRow(row)) continue;
    if (containsSkipPhrase(row)) continue;

    // Raw cell values (before carry-forward).
    const cellCategory = cell(row, colCategory);
    const cellItem = cell(row, colItem);
    const cellRequirement = cell(row, colRequirement);
    const stepsAndExpected = cell(row, colSteps);
    const note = colNote >= 0 ? cell(row, colNote) : "";

    // Skip rows with no real content BEFORE touching carry-forward state, so a
    // blank/noise row can't pollute lastCategory / lastItem / lastRequirement.
    if (!cellRequirement && !stepsAndExpected && !note) continue;

    // Continuation check must use the PREVIOUS resolved values (before update).
    const sameCategory = !cellCategory || cellCategory === lastCategory;
    const sameItem = !cellItem || cellItem === lastItem;
    const isSameArticleContinuation = sameCategory && sameItem;

    // Category / item carry-forward (unchanged logic), then display fallbacks.
    const resolvedCategory = cellCategory || lastCategory;
    const resolvedItem = cellItem || lastItem;
    lastCategory = resolvedCategory;
    lastItem = resolvedItem;
    const category = resolvedCategory || "未分类";
    const item = resolvedItem || "未命名项目";

    // Requirement carry-forward (merged cell OR repeated item text in source):
    // - own value → use it and remember it
    // - blank + same article (same category & item) → inherit
    // - blank + new article → no requirement; reset so it doesn't leak forward
    let requirement: string;
    if (cellRequirement) {
      requirement = cellRequirement;
      lastRequirement = cellRequirement;
    } else if (isSameArticleContinuation) {
      requirement = lastRequirement;
    } else {
      requirement = "";
      lastRequirement = "";
    }

    seq += 1;
    cases.push({
      id: `case-${seq}`,
      category,
      item,
      requirement,
      stepsAndExpected,
      note: note || undefined,
      needScreenshot: needsScreenshot(requirement, stepsAndExpected, note),
    });
  }

  return cases;
}
