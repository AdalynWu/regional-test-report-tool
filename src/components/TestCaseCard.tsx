import type { TestCase, TestResult } from "../types/report";
import { TestResultForm } from "./TestResultForm";
import { RichText } from "./RichText";

interface TestCaseCardProps {
  testCase: TestCase;
  result?: TestResult;
  onChange: (result: TestResult) => void;
}

export function TestCaseCard({ testCase, result, onChange }: TestCaseCardProps) {
  return (
    <article className="case-card">
      <header className="case-header">
        <span className="case-id">{testCase.id}</span>
        <h4 className="case-item">
          <RichText text={testCase.item} />
        </h4>
      </header>

      {testCase.requirement && (
        <div className="case-block">
          <span className="case-block-label">测试规范与要求</span>
          <p className="case-text">
            <RichText text={testCase.requirement} />
          </p>
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

      {testCase.needScreenshot && (
        <p className="screenshot-hint">此项目可能需要上传截图</p>
      )}

      <TestResultForm
        caseId={testCase.id}
        value={result}
        onChange={onChange}
      />
    </article>
  );
}
