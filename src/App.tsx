import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
  TestCaseMeta,
  TestReportDraft,
  TestResult,
} from "./types/report";
import { fetchTestCases } from "./features/testCase/testCase.service";
import { getCurrentProject } from "./features/project/getCurrentProject";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { PreTestChecklist } from "./components/PreTestChecklist";
import { TestCaseList } from "./components/TestCaseList";
import { AttachmentForm } from "./components/AttachmentForm";
import { ReportPreview } from "./components/ReportPreview";
import { ReportActions } from "./components/ReportActions";
import { InstructionCard } from "./components/InstructionCard";
import { TestCaseMetaCard } from "./components/TestCaseMetaCard";
import { TestVersionDownloadSection } from "./components/TestVersionDownloadSection";
import { SideNav } from "./components/SideNav";

function createEmptyBasicInfo(): BasicInfo {
  return {
    testerName: "",
    testDate: dayjs().format("YYYY-MM-DD"),
    testAccount: "",
    deviceModel: "",
    osVersion: "",
    location: "",
    appVersion: "",
    isp: "",
    networkType: "",
  };
}

const project = getCurrentProject();

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [meta, setMeta] = useState<TestCaseMeta | null>(null);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>(createEmptyBasicInfo);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo>({});

  useEffect(() => {
    let cancelled = false;

    fetchTestCases(project.csvPath, {
      categoryMode: project.caseCategoryMode ?? "category",
    })
      .then(({ testCases, meta }) => {
        if (cancelled) return;
        setTestCases(testCases);
        setMeta(meta);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "读取测试案例失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleResultChange = (caseId: string, result: TestResult) => {
    setResults((prev) => ({ ...prev, [caseId]: result }));
  };

  const handleLoadDraft = (draft: TestReportDraft) => {
    if (draft.basicInfo) setBasicInfo(draft.basicInfo);
    setResults(draft.results ?? {});
    setAttachmentInfo(draft.attachmentInfo ?? {});
  };

  // Confirm before switching payment method (may hide already-filled results).
  const handleBasicInfoChange = (next: BasicInfo) => {
    if (
      project.filterByPaymentMethod &&
      basicInfo.paymentMethod &&
      next.paymentMethod !== basicInfo.paymentMethod &&
      !window.confirm(
        "切换付款方式可能会隐藏当前已填写的部分测试结果，是否继续？",
      )
    ) {
      return;
    }
    setBasicInfo(next);
  };

  const needsPaymentMethod =
    !!project.filterByPaymentMethod && !basicInfo.paymentMethod;

  const visibleTestCases =
    project.filterByPaymentMethod && basicInfo.paymentMethod
      ? testCases.filter(
          (tc) =>
            tc.paymentMethod === basicInfo.paymentMethod ||
            tc.paymentMethod === "all" ||
            !tc.paymentMethod,
        )
      : testCases;

  const draftScope = project.filterByPaymentMethod
    ? basicInfo.paymentMethod
    : undefined;

  return (
    <div className="app">
      <header className="app-header">
        <h1>{project.title}</h1>
        {project.subtitle && <p className="app-subtitle">{project.subtitle}</p>}
      </header>

      {loading && <p className="status-message">读取测试案例中...</p>}

      {!loading && error && (
        <div className="card error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && testCases.length === 0 && (
        <div className="card error-message">
          <p>未解析到任何测试案例，请确认 CSV 格式是否正确</p>
        </div>
      )}

      {!loading && !error && testCases.length > 0 && (
        <div className="app-shell">
          <main className="app-main">
            <section id="instructions" className="section-anchor">
              <InstructionCard instructions={project.instructions} />
            </section>
            {meta && (
              <section id="test-case-meta" className="section-anchor">
                <TestCaseMetaCard meta={meta} />
              </section>
            )}
            <section id="basic-info" className="section-anchor">
              <BasicInfoForm
                value={basicInfo}
                fields={project.basicInfoFields}
                environmentScreenshotFields={project.environmentScreenshotFields}
                onChange={handleBasicInfoChange}
              />
            </section>
            <section id="pre-test-checklist" className="section-anchor">
              <PreTestChecklist items={project.preTestChecklistItems} />
            </section>
            {project.showVersionDownloadSection && (
              <section id="version-download" className="section-anchor">
                <TestVersionDownloadSection
                  testVersionLinks={project.testVersionLinks}
                />
              </section>
            )}
            <section id="test-cases" className="section-anchor">
              {needsPaymentMethod ? (
                <div className="card">
                  <p className="empty-hint">
                    请先选择本次指定的付款方式，系统会显示对应测试案例。
                  </p>
                </div>
              ) : (
                <TestCaseList
                  testCases={visibleTestCases}
                  results={results}
                  onResultChange={handleResultChange}
                />
              )}
            </section>
            <section id="attachment" className="section-anchor">
              <AttachmentForm
                value={attachmentInfo}
                onChange={setAttachmentInfo}
              />
            </section>
            <section id="report-preview" className="section-anchor">
              <ReportPreview
                basicInfo={basicInfo}
                testCases={visibleTestCases}
                results={results}
                attachmentInfo={attachmentInfo}
              />
            </section>
            <section id="report-actions" className="section-anchor">
              <ReportActions
                basicInfo={basicInfo}
                results={results}
                attachmentInfo={attachmentInfo}
                testCases={visibleTestCases}
                testCaseMeta={meta ?? undefined}
                project={project}
                draftScope={draftScope}
                onLoadDraft={handleLoadDraft}
              />
            </section>
          </main>

          <SideNav />
        </div>
      )}
    </div>
  );
}

export default App;
