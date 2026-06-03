import type { TestResult } from "../types/report";
import type { TestCaseArticle } from "../features/testCase/groupTestCasesByArticle";
import { TestResultForm } from "./TestResultForm";
import { RichText } from "./RichText";

interface TestCaseArticleCardProps {
  article: TestCaseArticle;
  results: Record<string, TestResult>;
  onResultChange: (caseId: string, result: TestResult) => void;
}

export function TestCaseArticleCard({
  article,
  results,
  onResultChange,
}: TestCaseArticleCardProps) {
  const { cases } = article;
  const first = cases[0];
  const last = cases[cases.length - 1];
  const isMulti = cases.length > 1;
  const idRange = isMulti ? `${first.id} ~ ${last.id}` : first.id;
  const needScreenshot = cases.some((c) => c.needScreenshot);

  return (
    <article className="article-card">
      <header className="article-header">
        <span className="case-id">{idRange}</span>
        <h4 className="case-item">
          <RichText text={article.item} />
        </h4>
      </header>

      {article.requirement && (
        <div className="article-requirement">
          <span className="case-block-label">测试规范与要求</span>
          <p className="case-text">
            <RichText text={article.requirement} />
          </p>
        </div>
      )}

      {needScreenshot && (
        <p className="screenshot-hint">此项目可能需要上传截图</p>
      )}

      <div className="step-list">
        {cases.map((testCase, index) => (
          <div key={testCase.id} className="step-card">
            {isMulti && (
              <div className="step-header">
                <span className="step-index">Step {index + 1}</span>
                <span className="case-id">{testCase.id}</span>
              </div>
            )}

            {testCase.stepsAndExpected && (
              <div className="case-block">
                <span className="case-block-label">测试步骤与预期</span>
                <p className="case-text case-steps">
                  <RichText text={testCase.stepsAndExpected} />
                </p>
              </div>
            )}

            {testCase.note && (
              <div className="case-block">
                <span className="case-block-label">NOTE</span>
                <p className="case-text">
                  <RichText text={testCase.note} />
                </p>
              </div>
            )}

            <TestResultForm
              caseId={testCase.id}
              value={results[testCase.id]}
              onChange={(result) => onResultChange(testCase.id, result)}
            />
          </div>
        ))}
      </div>
    </article>
  );
}
