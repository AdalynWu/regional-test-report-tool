import type { TestCase, TestResult } from "../types/report";
import { groupTestCasesByArticle } from "../features/testCase/groupTestCasesByArticle";
import { TestCaseArticleCard } from "./TestCaseArticleCard";

interface TestCaseListProps {
  testCases: TestCase[];
  results: Record<string, TestResult>;
  onResultChange: (caseId: string, result: TestResult) => void;
}

/** Group cases by category, preserving first-seen order. */
function groupByCategory(testCases: TestCase[]): [string, TestCase[]][] {
  const groups = new Map<string, TestCase[]>();
  for (const testCase of testCases) {
    const key = testCase.category || "未分类";
    const existing = groups.get(key);
    if (existing) {
      existing.push(testCase);
    } else {
      groups.set(key, [testCase]);
    }
  }
  return Array.from(groups.entries());
}

export function TestCaseList({
  testCases,
  results,
  onResultChange,
}: TestCaseListProps) {
  const grouped = groupByCategory(testCases);

  if (testCases.length === 0) {
    return (
      <section className="card">
        <p className="empty-hint">没有可显示的测试案例。</p>
      </section>
    );
  }

  return (
    <div className="case-groups">
      {grouped.map(([category, cases]) => (
        <section key={category} className="card category-section">
          <h3 className="category-title">{category}</h3>
          <div className="case-list">
            {groupTestCasesByArticle(cases).map((article) => (
              <TestCaseArticleCard
                key={article.id}
                article={article}
                results={results}
                onResultChange={onResultChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
