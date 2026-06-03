import type { TestReport, TestStatus } from "../../types/report";
import { computeReportStats } from "./reportStats";

const PLACEHOLDER = "未填写";

const STATUS_LABELS: Record<TestStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  blocked: "Blocked",
  not_tested: "Not Tested",
  need_confirm: "Need Confirm",
};

/** Escape text for safe insertion into HTML element / attribute content. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Map a status to its human-readable label. */
function formatStatus(status: TestStatus | undefined): string {
  return STATUS_LABELS[status ?? "not_tested"];
}

/** Trimmed escaped value, or the placeholder when empty. */
function formatValue(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed ? escapeHtml(trimmed) : PLACEHOLDER;
}

/** Only accept real image data URLs as <img> sources. */
function isImageDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

/** Only treat http(s) URLs as clickable links. */
function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function renderImage(src: string | undefined, alt: string): string {
  if (!isImageDataUrl(src)) return `<span class="empty">${PLACEHOLDER}</span>`;
  return `<img class="screenshot-preview" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
}

function renderImageList(srcs: string[], altPrefix: string): string {
  const valid = srcs.filter(isImageDataUrl);
  if (valid.length === 0) return `<span class="empty">${PLACEHOLDER}</span>`;
  return `<div class="screenshot-grid">${valid
    .map(
      (src, i) =>
        `<img class="screenshot-preview" src="${escapeHtml(src)}" alt="${escapeHtml(
          `${altPrefix} ${i + 1}`,
        )}" />`,
    )
    .join("")}</div>`;
}

/** Render a value that may be a clickable link (http/https only) or plain text. */
function renderLink(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return PLACEHOLDER;
  if (isHttpUrl(trimmed)) {
    const safe = escapeHtml(trimmed);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
  }
  return escapeHtml(trimmed);
}

/** One label/value row inside an info section. */
function infoRow(label: string, valueHtml: string): string {
  return `<div class="info-row"><span class="info-label">${escapeHtml(
    label,
  )}</span><span class="info-value">${valueHtml}</span></div>`;
}

const STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    background: #f4f5f7;
    color: #1f2430;
    font-family: system-ui, "Segoe UI", "Microsoft JhengHei", "PingFang SC", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.55;
  }
  .report { max-width: 960px; margin: 0 auto; }
  .report-header { margin-bottom: 20px; }
  .report-header h1 { font-size: 26px; margin: 0 0 4px; }
  .generated-at { color: #6b7280; margin: 0; }
  .card {
    background: #fff;
    border: 1px solid #e1e4ea;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(16,24,40,0.08);
    padding: 20px;
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 18px;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1e4ea;
  }
  .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px 24px; }
  .info-row { display: flex; gap: 8px; }
  .info-label { font-weight: 600; color: #6b7280; min-width: 96px; }
  .info-value { flex: 1; white-space: pre-wrap; word-break: break-word; }
  .info-value a { color: #2563eb; }
  .empty { color: #9ca3af; }
  img { max-width: 100%; }
  .screenshot-preview {
    max-width: 220px;
    max-height: 220px;
    object-fit: contain;
    border: 1px solid #cbd1da;
    border-radius: 6px;
    background: #fff;
  }
  .screenshot-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .screenshot-row { display: flex; flex-wrap: wrap; gap: 24px; }
  .screenshot-row .info-row { flex-direction: column; gap: 6px; }
  .case {
    border: 1px solid #e1e4ea;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fcfcfd;
  }
  .case-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .case-id {
    font-size: 12px; font-weight: 600; color: #6b7280;
    background: #eef0f4; padding: 2px 8px; border-radius: 999px;
  }
  .case-category { font-size: 12px; color: #2563eb; }
  .case-item { font-size: 15px; margin: 0; }
  .case-block { margin-bottom: 10px; }
  .case-block-label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 2px; }
  .case-text { margin: 0; white-space: pre-wrap; word-break: break-word; }
  .status-badge {
    display: inline-block; padding: 2px 10px; border-radius: 999px;
    font-size: 12px; font-weight: 600; border: 1px solid #cbd1da; background: #fff;
  }
  .status-pass { color: #047857; border-color: #6ee7b7; background: #ecfdf5; }
  .status-fail { color: #b91c1c; border-color: #fca5a5; background: #fef2f2; }
  .status-blocked { color: #b45309; border-color: #fcd34d; background: #fffbeb; }
  .status-need_confirm { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }
  .status-not_tested { color: #6b7280; border-color: #d1d5db; background: #f9fafb; }
  @media (max-width: 640px) {
    .info-grid { grid-template-columns: 1fr; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .card { box-shadow: none; border: 1px solid #d1d5db; break-inside: avoid; }
    .case { break-inside: avoid; }
  }
`;

/** Build the complete, self-contained HTML report document as a string. */
export function generateReportHtml(report: TestReport): string {
  const { basicInfo, attachmentInfo, testCases, results } = report;
  const stats = computeReportStats(testCases, results);

  const meta = report.testCaseMeta;
  const metaRows = meta
    ? `
        ${infoRow("测试案例来源", formatValue(meta.sourceName))}
        ${infoRow("载入时间", formatValue(meta.loadedAt))}
        ${infoRow("测试案例总数", String(meta.totalCases))}`
    : "";

  const summarySection = `
    <section class="card">
      <h2 class="section-title">完成度摘要</h2>
      <div class="info-grid">
        ${metaRows || infoRow("测试案例总数", String(stats.total))}
        ${infoRow("已填写", String(stats.filled))}
        ${infoRow("未填写", String(stats.unfilled))}
        ${infoRow("完成率", `${stats.completionRate}%`)}
      </div>
    </section>`;

  const basicSection = `
    <section class="card">
      <h2 class="section-title">基本信息</h2>
      <div class="info-grid">
        ${infoRow("测试人员", formatValue(basicInfo.testerName))}
        ${infoRow("测试日期", formatValue(basicInfo.testDate))}
        ${infoRow("测试帐号", formatValue(basicInfo.testAccount))}
        ${infoRow("设备型号", formatValue(basicInfo.deviceModel))}
        ${infoRow("系统版本", formatValue(basicInfo.osVersion))}
        ${infoRow("测试地区", formatValue(basicInfo.location))}
        ${infoRow("App 版本", formatValue(basicInfo.appVersion))}
      </div>
    </section>`;

  const networkSection = `
    <section class="card">
      <h2 class="section-title">网络信息</h2>
      <div class="info-grid">
        ${infoRow("电信业者 / ISP", formatValue(basicInfo.isp))}
        ${infoRow("网络类型", formatValue(basicInfo.networkType))}
        ${infoRow("DNS 设置", formatValue(basicInfo.dnsSetting))}
        ${infoRow("下载速度", formatValue(basicInfo.downloadSpeed))}
        ${infoRow("上传速度", formatValue(basicInfo.uploadSpeed))}
      </div>
    </section>`;

  const envScreenshotSection = `
    <section class="card">
      <h2 class="section-title">环境截图</h2>
      <div class="screenshot-row">
        <div class="info-row"><span class="case-block-label">网速测试截图</span>${renderImage(
          basicInfo.networkScreenshot,
          "网速测试截图",
        )}</div>
        <div class="info-row"><span class="case-block-label">DNS 设置截图</span>${renderImage(
          basicInfo.dnsScreenshot,
          "DNS 设置截图",
        )}</div>
        <div class="info-row"><span class="case-block-label">Process ID 截图</span>${renderImage(
          basicInfo.processIdScreenshot,
          "Process ID 截图",
        )}</div>
      </div>
    </section>`;

  const caseItems = testCases
    .map((testCase) => {
      const result = results[testCase.id];
      const status = result?.status ?? "not_tested";
      return `
      <div class="case">
        <div class="case-head">
          <span class="case-id">${escapeHtml(testCase.id)}</span>
          <span class="case-category">${formatValue(testCase.category)}</span>
          <h3 class="case-item">${formatValue(testCase.item)}</h3>
        </div>
        <div class="case-block"><span class="case-block-label">测试规范与要求</span><p class="case-text">${formatValue(
          testCase.requirement,
        )}</p></div>
        <div class="case-block"><span class="case-block-label">测试步骤与预期</span><p class="case-text">${formatValue(
          testCase.stepsAndExpected,
        )}</p></div>
        <div class="case-block"><span class="case-block-label">测试结果</span><span class="status-badge status-${status}">${escapeHtml(
          formatStatus(status),
        )}</span></div>
        <div class="case-block"><span class="case-block-label">等待时间</span><p class="case-text">${formatValue(
          result?.waitingTime,
        )}</p></div>
        <div class="case-block"><span class="case-block-label">实际结果</span><p class="case-text">${formatValue(
          result?.actualResult,
        )}</p></div>
        <div class="case-block"><span class="case-block-label">备注</span><p class="case-text">${formatValue(
          result?.note,
        )}</p></div>
        <div class="case-block"><span class="case-block-label">截图</span>${renderImageList(
          result?.screenshots ?? [],
          `${testCase.id} 截图`,
        )}</div>
      </div>`;
    })
    .join("");

  const caseSection = `
    <section class="card">
      <h2 class="section-title">测试案例结果（共 ${testCases.length} 项）</h2>
      ${caseItems || `<p class="empty">${PLACEHOLDER}</p>`}
    </section>`;

  const attachmentSection = `
    <section class="card">
      <h2 class="section-title">附件信息</h2>
      <div class="info-grid">
        ${infoRow("录影连结", renderLink(attachmentInfo.recordingUrl))}
        ${infoRow(".har 档案连结", renderLink(attachmentInfo.harFileUrl))}
        ${infoRow("其他备注", formatValue(attachmentInfo.extraNote))}
      </div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(report.title)}</title>
<style>${STYLE}</style>
</head>
<body>
<div class="report">
  <header class="report-header">
    <h1>${escapeHtml(report.title)}</h1>
    <p class="generated-at">生成时间：${formatValue(report.generatedAt)}</p>
  </header>
  ${summarySection}
  ${basicSection}
  ${networkSection}
  ${envScreenshotSection}
  ${caseSection}
  ${attachmentSection}
</div>
</body>
</html>`;
}
