import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
  TestResult,
} from "./types/report";
import { fetchTestCases } from "./features/testCase/testCase.service";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { PreTestChecklist } from "./components/PreTestChecklist";
import { TestCaseList } from "./components/TestCaseList";
import { AttachmentForm } from "./components/AttachmentForm";

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
    dnsSetting: "",
    downloadSpeed: "",
    uploadSpeed: "",
  };
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>(createEmptyBasicInfo);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo>({});

  useEffect(() => {
    let cancelled = false;

    fetchTestCases()
      .then((cases) => {
        if (cancelled) return;
        setTestCases(cases);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>区域测试报告工具</h1>
        <p className="app-subtitle">填写测试结果并上传截图</p>
      </header>

      {loading && <p className="status-message">读取测试案例中...</p>}

      {!loading && error && (
        <div className="card error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <main className="app-main">
          <BasicInfoForm value={basicInfo} onChange={setBasicInfo} />
          <PreTestChecklist />
          <TestCaseList
            testCases={testCases}
            results={results}
            onResultChange={handleResultChange}
          />
          <AttachmentForm value={attachmentInfo} onChange={setAttachmentInfo} />
        </main>
      )}
    </div>
  );
}

export default App;
