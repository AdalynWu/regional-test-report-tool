import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
  TestResult,
  TestStatus,
} from "../types/report";

interface ReportPreviewProps {
  basicInfo: BasicInfo;
  testCases: TestCase[];
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
}

const STATUS_LABELS: Record<TestStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  blocked: "Blocked",
  need_confirm: "Need Confirm",
  not_tested: "Not Tested",
};

const SHOWN_STATUSES: TestStatus[] = [
  "pass",
  "fail",
  "blocked",
  "need_confirm",
  "not_tested",
];

function shown(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed || "未填写";
}

export function ReportPreview({
  basicInfo,
  testCases,
  results,
  attachmentInfo,
}: ReportPreviewProps) {
  const total = testCases.length;

  // 已填寫 = result exists with a status other than not_tested.
  const filledCount = testCases.filter((tc) => {
    const r = results[tc.id];
    return r != null && r.status !== "not_tested";
  }).length;

  const tally: Record<TestStatus, number> = {
    pass: 0,
    fail: 0,
    blocked: 0,
    need_confirm: 0,
    not_tested: 0,
  };
  for (const tc of testCases) {
    const status = results[tc.id]?.status ?? "not_tested";
    tally[status] += 1;
  }

  return (
    <section className="card">
      <h2 className="section-title">报告预览</h2>

      <div className="preview-summary">
        <div className="info-row">
          <span className="info-label">测试人员</span>
          <span>{shown(basicInfo.testerName)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">测试日期</span>
          <span>{shown(basicInfo.testDate)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">测试地区</span>
          <span>{shown(basicInfo.location)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">设备型号</span>
          <span>{shown(basicInfo.deviceModel)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">App 版本</span>
          <span>{shown(basicInfo.appVersion)}</span>
        </div>
      </div>

      <p className="preview-count">
        测试案例总数 <strong>{total}</strong> ・ 已填写{" "}
        <strong>{filledCount}</strong>
      </p>

      <div className="stat-chips">
        {SHOWN_STATUSES.map((status) => (
          <span key={status} className={`stat-chip stat-${status}`}>
            {STATUS_LABELS[status]}: {tally[status]}
          </span>
        ))}
      </div>

      <div className="preview-attachments">
        <span>
          录影连结：{attachmentInfo.recordingUrl?.trim() ? "已填写" : "未填写"}
        </span>
        <span>
          .har 连结：{attachmentInfo.harFileUrl?.trim() ? "已填写" : "未填写"}
        </span>
      </div>
    </section>
  );
}
