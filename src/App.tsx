import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  Platform,
  PlatformData,
  TestCase,
  TestCaseMeta,
  TestReportDraft,
  TestResult,
} from "./types/report";
import { fetchTestCases } from "./features/testCase/testCase.service";
import { getCurrentProject } from "./features/project/getCurrentProject";
import { platformLabel } from "./config/projects";
import { saveDraft } from "./features/report/reportStorage";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { PreTestChecklist } from "./components/PreTestChecklist";
import { TestCaseList } from "./components/TestCaseList";
import { AttachmentForm } from "./components/AttachmentForm";
import { ReportPreview } from "./components/ReportPreview";
import { ReportActions } from "./components/ReportActions";
import { InstructionCard } from "./components/InstructionCard";
import { TestCaseMetaCard } from "./components/TestCaseMetaCard";
import { TestVersionDownloadSection } from "./components/TestVersionDownloadSection";
import { TestDomainSection } from "./components/TestDomainSection";
import { SideNav } from "./components/SideNav";
import { PlatformTabs } from "./components/PlatformTabs";

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
const isDual = !!project.dualPlatform;
const otherPlatform = (p: Platform): Platform =>
  p === "android" ? "ios" : "android";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [meta, setMeta] = useState<TestCaseMeta | null>(null);

  // Single-platform state (non-dual projects).
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(createEmptyBasicInfo);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Dual-platform state (e.g. ramen) — each platform is independent.
  const [activePlatform, setActivePlatform] = useState<Platform>("android");
  const [basicInfoByPlatform, setBasicInfoByPlatform] = useState<
    Record<Platform, BasicInfo>
  >(() => ({ android: createEmptyBasicInfo(), ios: createEmptyBasicInfo() }));
  const [resultsByPlatform, setResultsByPlatform] = useState<
    Record<Platform, Record<string, TestResult>>
  >(() => ({ android: {}, ios: {} }));
  const [attachmentByPlatform, setAttachmentByPlatform] = useState<
    Record<Platform, AttachmentInfo>
  >(() => ({ android: {}, ios: {} }));
  const [checklistByPlatform, setChecklistByPlatform] = useState<
    Record<Platform, Record<string, boolean>>
  >(() => ({ android: {}, ios: {} }));

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

  // Active slices the shared UI binds to.
  const activeBasicInfo = isDual ? basicInfoByPlatform[activePlatform] : basicInfo;
  const activeResults = isDual ? resultsByPlatform[activePlatform] : results;
  const activeAttachment = isDual
    ? attachmentByPlatform[activePlatform]
    : attachmentInfo;
  const activeChecklist = isDual
    ? checklistByPlatform[activePlatform]
    : checklist;

  const handleResultChange = (caseId: string, result: TestResult) => {
    if (!isDual) {
      setResults((prev) => ({ ...prev, [caseId]: result }));
      return;
    }
    setResultsByPlatform((prev) => ({
      ...prev,
      [activePlatform]: { ...prev[activePlatform], [caseId]: result },
    }));
  };

  const handleAttachmentChange = (next: AttachmentInfo) => {
    if (!isDual) {
      setAttachmentInfo(next);
      return;
    }
    setAttachmentByPlatform((prev) => ({ ...prev, [activePlatform]: next }));
  };

  const handleChecklistChange = (next: Record<string, boolean>) => {
    if (!isDual) {
      setChecklist(next);
      return;
    }
    setChecklistByPlatform((prev) => ({ ...prev, [activePlatform]: next }));
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

    if (!isDual) {
      setBasicInfo(next);
      return;
    }

    // Dual: write the active platform, and mirror shared keys to the other.
    setBasicInfoByPlatform((prev) => {
      const prevActive = prev[activePlatform];
      const sharedKeys = project.sharedBasicInfoKeys ?? [];
      const other = otherPlatform(activePlatform);
      const sharedPatch: Record<string, unknown> = {};
      for (const key of sharedKeys) {
        if (next[key] !== prevActive[key]) sharedPatch[key] = next[key];
      }
      return {
        ...prev,
        [activePlatform]: next,
        [other]: { ...prev[other], ...sharedPatch },
      };
    });
  };

  const handleLoadDraft = (draft: TestReportDraft) => {
    if (isDual) {
      if (draft.platforms) {
        setBasicInfoByPlatform({
          android: draft.platforms.android?.basicInfo ?? createEmptyBasicInfo(),
          ios: draft.platforms.ios?.basicInfo ?? createEmptyBasicInfo(),
        });
        setResultsByPlatform({
          android: draft.platforms.android?.results ?? {},
          ios: draft.platforms.ios?.results ?? {},
        });
        setAttachmentByPlatform({
          android: draft.platforms.android?.attachmentInfo ?? {},
          ios: draft.platforms.ios?.attachmentInfo ?? {},
        });
      } else {
        // Legacy single draft → load into the Android slice.
        setBasicInfoByPlatform((prev) => ({
          ...prev,
          android: draft.basicInfo ?? createEmptyBasicInfo(),
        }));
        setResultsByPlatform((prev) => ({
          ...prev,
          android: draft.results ?? {},
        }));
        setAttachmentByPlatform((prev) => ({
          ...prev,
          android: draft.attachmentInfo ?? {},
        }));
      }
      return;
    }
    if (draft.basicInfo) setBasicInfo(draft.basicInfo);
    setResults(draft.results ?? {});
    setAttachmentInfo(draft.attachmentInfo ?? {});
  };

  const needsPaymentMethod =
    !!project.filterByPaymentMethod && !activeBasicInfo.paymentMethod;

  const visibleTestCases =
    project.filterByPaymentMethod && activeBasicInfo.paymentMethod
      ? testCases.filter(
          (tc) =>
            tc.paymentMethod === activeBasicInfo.paymentMethod ||
            tc.paymentMethod === "all" ||
            !tc.paymentMethod,
        )
      : testCases;

  const draftScope = project.filterByPaymentMethod
    ? activeBasicInfo.paymentMethod
    : undefined;

  // iOS does not collect Android-only screenshots (e.g. Process ID).
  const activeEnvScreenshotFields =
    isDual && activePlatform === "ios"
      ? (project.environmentScreenshotFields ?? []).filter((f) => !f.androidOnly)
      : project.environmentScreenshotFields;

  const platforms: Record<Platform, PlatformData> = {
    android: {
      basicInfo: basicInfoByPlatform.android,
      results: resultsByPlatform.android,
      attachmentInfo: attachmentByPlatform.android,
    },
    ios: {
      basicInfo: basicInfoByPlatform.ios,
      results: resultsByPlatform.ios,
      attachmentInfo: attachmentByPlatform.ios,
    },
  };

  const buildDraft = (): TestReportDraft =>
    isDual
      ? {
          basicInfo: platforms.android.basicInfo,
          results: platforms.android.results,
          attachmentInfo: platforms.android.attachmentInfo,
          platforms,
        }
      : { basicInfo, results, attachmentInfo };

  const handleSaveDraft = () => {
    saveDraft(project.id, buildDraft(), draftScope);
  };

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
            {isDual && (
              <section id="platform" className="section-anchor">
                <PlatformTabs
                  active={activePlatform}
                  onChange={setActivePlatform}
                />
              </section>
            )}
            <section id="basic-info" className="section-anchor">
              <BasicInfoForm
                value={activeBasicInfo}
                fields={project.basicInfoFields}
                environmentScreenshotFields={activeEnvScreenshotFields}
                onChange={handleBasicInfoChange}
              />
            </section>
            <section id="pre-test-checklist" className="section-anchor">
              <PreTestChecklist
                items={project.preTestChecklistItems}
                checked={activeChecklist}
                onChange={handleChecklistChange}
              />
            </section>
            {project.showVersionDownloadSection && (
              <section id="version-download" className="section-anchor">
                <TestVersionDownloadSection
                  testVersionLinks={project.testVersionLinks}
                />
              </section>
            )}
            {project.testDomainLinks && (
              <section id="test-domain" className="section-anchor">
                <TestDomainSection url={project.testDomainLinks.url} />
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
                  results={activeResults}
                  onResultChange={handleResultChange}
                />
              )}
            </section>
            <section id="attachment" className="section-anchor">
              <AttachmentForm
                value={activeAttachment}
                onChange={handleAttachmentChange}
              />
            </section>
            <section id="report-preview" className="section-anchor">
              {isDual ? (
                <>
                  <ReportPreview
                    label={platformLabel("android")}
                    basicInfo={platforms.android.basicInfo}
                    testCases={visibleTestCases}
                    results={platforms.android.results}
                    attachmentInfo={platforms.android.attachmentInfo}
                  />
                  <ReportPreview
                    label={platformLabel("ios")}
                    basicInfo={platforms.ios.basicInfo}
                    testCases={visibleTestCases}
                    results={platforms.ios.results}
                    attachmentInfo={platforms.ios.attachmentInfo}
                  />
                </>
              ) : (
                <ReportPreview
                  basicInfo={basicInfo}
                  testCases={visibleTestCases}
                  results={results}
                  attachmentInfo={attachmentInfo}
                />
              )}
            </section>
            <section id="report-actions" className="section-anchor">
              <ReportActions
                basicInfo={activeBasicInfo}
                results={activeResults}
                attachmentInfo={activeAttachment}
                testCases={visibleTestCases}
                testCaseMeta={meta ?? undefined}
                project={project}
                draftScope={draftScope}
                testDomainUrl={project.testDomainLinks?.url}
                dualPlatform={isDual}
                platforms={isDual ? platforms : undefined}
                onSaveDraft={handleSaveDraft}
                onLoadDraft={handleLoadDraft}
              />
            </section>
          </main>

          <SideNav onSaveDraft={handleSaveDraft} />
        </div>
      )}
    </div>
  );
}

export default App;
