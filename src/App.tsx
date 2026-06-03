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
import { BasicInfoForm } from "./components/BasicInfoForm";
import { PreTestChecklist } from "./components/PreTestChecklist";
import { TestCaseList } from "./components/TestCaseList";
import { AttachmentForm } from "./components/AttachmentForm";
import { ReportPreview } from "./components/ReportPreview";
import { ReportActions } from "./components/ReportActions";
import { InstructionCard } from "./components/InstructionCard";
import { TestCaseMetaCard } from "./components/TestCaseMetaCard";
import { TestVersionDownloadSection } from "./components/TestVersionDownloadSection";
import { APP_TITLE } from "./config/appConfig";

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

    fetchTestCases()
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>{APP_TITLE}</h1>
        <p className="app-subtitle">填写测试结果并上传截图</p>
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
        <main className="app-main">
          <InstructionCard />
          {meta && <TestCaseMetaCard meta={meta} />}
          <BasicInfoForm value={basicInfo} onChange={setBasicInfo} />
          <PreTestChecklist />
          <TestVersionDownloadSection />
          <TestCaseList
            testCases={testCases}
            results={results}
            onResultChange={handleResultChange}
          />
          <AttachmentForm value={attachmentInfo} onChange={setAttachmentInfo} />
          <ReportPreview
            basicInfo={basicInfo}
            testCases={testCases}
            results={results}
            attachmentInfo={attachmentInfo}
          />
          <ReportActions
            basicInfo={basicInfo}
            results={results}
            attachmentInfo={attachmentInfo}
            testCases={testCases}
            testCaseMeta={meta ?? undefined}
            onLoadDraft={handleLoadDraft}
          />
        </main>
      )}
    </div>
  );
}

export default App;
