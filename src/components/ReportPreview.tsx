import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
  TestResult,
  TestStatus,
} from "../types/report";
import { computeReportStats } from "../features/report/reportStats";

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
  const stats = computeReportStats(testCases, results);

  const unfilledCases = testCases.filter((tc) => {
    const r = results[tc.id];
    return r == null || r.status === "not_tested";
  });
  const unfilledShown = unfilledCases.slice(0, 10);
  const unfilledRest = unfilledCases.length - unfilledShown.length;

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
        测试案例总数 <strong>{stats.total}</strong> ・ 已填写{" "}
        <strong>{stats.filled}</strong> ・ 未填写{" "}
        <strong>{stats.unfilled}</strong> ・ 完成率{" "}
        <strong>{stats.completionRate}%</strong>
      </p>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={stats.completionRate}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-bar"
          style={{ width: `${stats.completionRate}%` }}
        />
      </div>

      <div className="stat-chips">
        {SHOWN_STATUSES.map((status) => (
          <span key={status} className={`stat-chip stat-${status}`}>
            {STATUS_LABELS[status]}: {stats.tally[status]}
          </span>
        ))}
      </div>

      {unfilledCases.length > 0 && (
        <div className="unfilled-block">
          <p className="unfilled-title">未填写案例</p>
          <ul className="unfilled-list">
            {unfilledShown.map((tc) => (
              <li key={tc.id}>
                <span className="unfilled-id">{tc.id}</span>
                <span className="unfilled-cat">{tc.category}</span>
                <span className="unfilled-item">{tc.item}</span>
              </li>
            ))}
          </ul>
          {unfilledRest > 0 && (
            <p className="unfilled-more">另有 {unfilledRest} 个未填写案例</p>
          )}
        </div>
      )}

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
