import type { TestReport, TestStatus } from "../../types/report";
import { computeReportStats } from "./reportStats";
import { parseRichText } from "../../utils/richText";
import { groupTestCasesByArticle } from "../testCase/groupTestCasesByArticle";

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

/**
 * Escaped value with {red}...{/red} markers converted to highlight spans.
 * Each text segment is still escaped, so HTML safety is preserved.
 */
function renderRichText(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return PLACEHOLDER;
  return parseRichText(trimmed)
    .map((seg) =>
      seg.highlight
        ? `<span class="hl-danger">${escapeHtml(seg.text)}</span>`
        : escapeHtml(seg.text),
    )
    .join("");
}

/** Only accept real image data URLs as <img> sources. */
function isImageDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

/** Only treat http(s) URLs as clickable links. */
function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

/** Wrap a preview image with a hover mask that says 点击预览. */
function imageThumb(src: string, alt: string): string {
  return `<span class="shot"><img class="screenshot-preview" src="${escapeHtml(
    src,
  )}" alt="${escapeHtml(
    alt,
  )}" /><span class="shot-hint">点击预览</span></span>`;
}

function renderImage(src: string | undefined, alt: string): string {
  if (!isImageDataUrl(src)) return `<span class="empty">${PLACEHOLDER}</span>`;
  return imageThumb(src, alt);
}

function renderImageList(srcs: string[], altPrefix: string): string {
  const valid = srcs.filter(isImageDataUrl);
  if (valid.length === 0) return `<span class="empty">${PLACEHOLDER}</span>`;
  return `<div class="screenshot-grid">${valid
    .map((src, i) => imageThumb(src, `${altPrefix} ${i + 1}`))
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

/** Render a version download link: http(s) → link, empty → 未设置, else plain text. */
function renderVersionLink(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "未设置";
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
    background: #f5f7fb;
    color: #111827;
    font-family: system-ui, "Segoe UI", "Microsoft JhengHei", "PingFang SC", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
  .report { max-width: 960px; margin: 0 auto; }
  .report-header {
    margin-bottom: 20px;
    padding: 22px 24px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(15,23,42,0.06);
  }
  .report-header h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 4px; }
  .generated-at { color: #6b7280; margin: 0; }
  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(15,23,42,0.06);
    padding: 24px;
    margin-bottom: 20px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  .section-title::before {
    content: "";
    width: 4px;
    align-self: stretch;
    min-height: 18px;
    background: #2563eb;
    border-radius: 999px;
  }
  .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px 24px; }
  .info-row { display: flex; gap: 8px; }
  .info-label { font-weight: 600; color: #6b7280; min-width: 96px; }
  .info-value { flex: 1; white-space: pre-wrap; word-break: break-word; }
  .info-value a { color: #2563eb; }
  .empty { color: #9ca3af; }
  img { max-width: 100%; }
  .shot {
    position: relative;
    display: inline-block;
    cursor: pointer;
    line-height: 0;
  }
  .screenshot-preview {
    display: block;
    max-width: 220px;
    max-height: 220px;
    object-fit: contain;
    border: 1px solid #cbd1da;
    border-radius: 6px;
    background: #fff;
  }
  .shot-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1.4;
    color: #fff;
    background: rgba(75, 85, 99, 0.55);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }
  .shot:hover .shot-hint { opacity: 1; }
  .img-modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
  }
  .img-modal.open { display: flex; }
  .img-modal img {
    max-width: 92vw;
    max-height: 88vh;
    object-fit: contain;
    border-radius: 6px;
    background: #fff;
    cursor: zoom-out;
  }
  .img-modal-close {
    position: fixed;
    top: 16px;
    right: 20px;
    appearance: none;
    -webkit-appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 8px 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    color: #111827;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
  }
  .img-modal-close:hover {
    background: #dbeafe;
    border-color: #2563eb;
    color: #1e40af;
  }
  .img-modal-close:active { transform: translateY(1px); }
  .img-modal-close:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }
  .screenshot-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .screenshot-row { display: flex; flex-wrap: wrap; gap: 24px; }
  .screenshot-row .info-row { flex-direction: column; gap: 6px; }
  .case {
    border: 1px solid #e5e7eb;
    border-top: 3px solid #dbeafe;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 16px;
    background: #fff;
  }
  .report-article {
    border: 1px solid #e5e7eb;
    border-top: 3px solid #2563eb;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 16px;
    background: #fff;
  }
  .report-step-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
  .report-step {
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-left: 3px solid #dbeafe;
    border-radius: 8px;
  }
  .report-step-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .step-index {
    font-size: 12px; font-weight: 700; color: #4b5563;
    background: #f3f4f6; border: 1px solid #d1d5db; padding: 3px 10px; border-radius: 999px;
  }
  .case-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .case-id {
    font-size: 12px; font-weight: 700; color: #1e40af;
    background: #dbeafe; padding: 3px 10px; border-radius: 999px;
  }
  .case-category { font-size: 18px; font-weight: 600; color: #2563eb; }
  .case-item { font-size: 15px; margin: 0; }
  .case-block { margin-bottom: 10px; }
  .case-block-label { display: block; font-size: 16px; font-weight: 600; color: #6b7280; margin-bottom: 2px; }
  .case-text { margin: 0; white-space: pre-wrap; word-break: break-word; }
  .hl-danger { color: #dc2626; font-weight: 600; }
  .status-badge {
    display: inline-block; padding: 3px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 700; border: 1px solid #cbd5e1; background: #fff;
  }
  .status-pass { color: #15803d; border-color: #86efac; background: #f0fdf4; }
  .status-fail { color: #b91c1c; border-color: #fca5a5; background: #fef2f2; }
  .status-blocked { color: #b45309; border-color: #fcd34d; background: #fffbeb; }
  .status-need_confirm { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }
  .status-not_tested { color: #64748b; border-color: #cbd5e1; background: #f8fafc; }
  @media (max-width: 640px) {
    .info-grid { grid-template-columns: 1fr; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .card { box-shadow: none; border: 1px solid #d1d5db; break-inside: avoid; }
    .case { break-inside: avoid; }
    .img-modal { display: none !important; }
  }
`;

/**
 * Inline, self-contained lightbox script. Clicking any .screenshot-preview
 * image opens a full-size modal; close via backdrop click, the close button,
 * or Esc. No external dependencies — works offline.
 */
const LIGHTBOX_SCRIPT = `
(function () {
  var modal = document.getElementById('img-modal');
  var modalImg = document.getElementById('img-modal-img');
  if (!modal || !modalImg) return;
  function open(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || '';
    modal.classList.add('open');
  }
  function close() {
    modal.classList.remove('open');
    modalImg.removeAttribute('src');
  }
  document.querySelectorAll('.screenshot-preview').forEach(function (img) {
    img.addEventListener('click', function () { open(img.src, img.alt); });
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modalImg) return;
    close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
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

  const versionLinks = report.testVersionLinks;
  const versionSection =
    report.showVersionDownloadSection === false
      ? ""
      : `
    <section class="card">
      <h2 class="section-title">本次测试版本下载</h2>
      <div class="info-grid">
        ${infoRow("Android APK", renderVersionLink(versionLinks?.apk))}
        ${infoRow("iOS", renderVersionLink(versionLinks?.ios))}
      </div>
    </section>`;

  // Conditional rows for project-specific fields (empty for Ramen → omitted).
  const paymentMethodLabel =
    basicInfo.paymentMethod === "alipay"
      ? "支付宝"
      : basicInfo.paymentMethod === "wechat"
        ? "微信"
        : "";
  const extraBasicRows = [
    basicInfo.iosDeviceModel?.trim()
      ? infoRow("iOS 设备型号", formatValue(basicInfo.iosDeviceModel))
      : "",
    basicInfo.androidDeviceModel?.trim()
      ? infoRow("Android 设备型号", formatValue(basicInfo.androidDeviceModel))
      : "",
    paymentMethodLabel ? infoRow("付款方式", escapeHtml(paymentMethodLabel)) : "",
  ].join("");

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
        ${extraBasicRows}
      </div>
    </section>`;

  const hasNetworkInfo =
    !!basicInfo.isp?.trim() || !!basicInfo.networkType?.trim();
  const networkSection = !hasNetworkInfo
    ? ""
    : `
    <section class="card">
      <h2 class="section-title">网络信息</h2>
      <div class="info-grid">
        ${infoRow("电信业者 / ISP", formatValue(basicInfo.isp))}
        ${infoRow("网络类型", formatValue(basicInfo.networkType))}
      </div>
    </section>`;

  const hasEnvScreenshots =
    isImageDataUrl(basicInfo.networkScreenshot) ||
    isImageDataUrl(basicInfo.dnsScreenshot) ||
    isImageDataUrl(basicInfo.processIdScreenshot);
  const envScreenshotSection = !hasEnvScreenshots
    ? ""
    : `
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

  const caseItems = groupTestCasesByArticle(testCases)
    .map((article) => {
      const first = article.cases[0];
      const last = article.cases[article.cases.length - 1];
      const isMulti = article.cases.length > 1;
      const idRange = isMulti ? `${first.id} ~ ${last.id}` : first.id;

      const steps = article.cases
        .map((testCase, index) => {
          const result = results[testCase.id];
          const status = result?.status ?? "not_tested";
          const stepTag = isMulti
            ? `<span class="step-index">Step ${index + 1}</span>`
            : "";
          return `
          <div class="report-step">
            <div class="report-step-head">
              ${stepTag}
              <span class="case-id">${escapeHtml(testCase.id)}</span>
            </div>
            <div class="case-block"><span class="case-block-label">测试步骤与预期</span><p class="case-text">${renderRichText(
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

      return `
      <div class="report-article">
        <div class="case-head">
          <span class="case-id">${escapeHtml(idRange)}</span>
          <span class="case-category">${formatValue(article.category)}</span>
          <h3 class="case-item">${renderRichText(article.item)}</h3>
        </div>
        <div class="case-block"><span class="case-block-label">测试规范与要求</span><p class="case-text">${renderRichText(
          article.requirement,
        )}</p></div>
        <div class="report-step-list">${steps}</div>
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
        ${infoRow("测试档案资料夹连结", renderLink(attachmentInfo.testFolderUrl))}
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
  ${versionSection}
  ${basicSection}
  ${networkSection}
  ${envScreenshotSection}
  ${caseSection}
  ${attachmentSection}
</div>
<div class="img-modal" id="img-modal" role="dialog" aria-label="截图预览">
  <button type="button" class="img-modal-close" aria-label="关闭">关闭</button>
  <img id="img-modal-img" alt="截图预览" />
</div>
<script>${LIGHTBOX_SCRIPT}</script>
</body>
</html>`;
}
