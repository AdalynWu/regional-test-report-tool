import { useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
  TestCaseMeta,
  TestReport,
  TestReportDraft,
  TestResult,
} from "../types/report";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "../features/report/reportStorage";
import { generateReportHtml } from "../features/report/generateReportHtml";
import { downloadHtml } from "../features/report/downloadHtml";
import { computeReportStats } from "../features/report/reportStats";
import { APP_TITLE } from "../config/appConfig";
import { TEST_VERSION_LINKS } from "../config/testVersionLinks";

interface ReportActionsProps {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
  testCases: TestCase[];
  testCaseMeta?: TestCaseMeta;
  onLoadDraft: (draft: TestReportDraft) => void;
}

/**
 * Make a filename safe: remove illegal characters, collapse consecutive
 * underscores, and trim surrounding whitespace. Internal spaces are kept.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/_+/g, "_")
    .trim();
}

/** Convert a test date to YYYYMMDD; fall back to today when empty. */
function formatDateForFilename(testDate: string): string {
  const trimmed = (testDate ?? "").trim();
  if (!trimmed) return dayjs().format("YYYYMMDD");
  return trimmed.replace(/-/g, "");
}

export function ReportActions({
  basicInfo,
  results,
  attachmentInfo,
  testCases,
  testCaseMeta,
  onLoadDraft,
}: ReportActionsProps) {
  const [status, setStatus] = useState("");

  const handleSave = () => {
    saveDraft({ basicInfo, results, attachmentInfo });
    setStatus("草稿已保存");
  };

  const handleLoad = () => {
    const draft = loadDraft();
    if (!draft) {
      setStatus("没有草稿");
      return;
    }
    onLoadDraft(draft);
    setStatus("草稿已载入");
  };

  const handleClear = () => {
    if (!window.confirm("确定要清除草稿吗？此操作无法复原。")) return;
    clearDraft();
    setStatus("草稿已清除");
  };

  const handleDownload = () => {
    // All basic-info fields (incl. the three screenshots) are required;
    // block the download until every one is filled.
    const requiredFields: { key: keyof BasicInfo; label: string }[] = [
      { key: "testerName", label: "测试人员" },
      { key: "testDate", label: "测试日期" },
      { key: "testAccount", label: "测试帐号/密码" },
      { key: "deviceModel", label: "设备型号" },
      { key: "osVersion", label: "系统版本" },
      { key: "location", label: "测试地区" },
      { key: "appVersion", label: "App 版本" },
      { key: "isp", label: "电信业者 / ISP" },
      { key: "networkType", label: "网络类型" },
      { key: "networkScreenshot", label: "网速测试截图" },
      { key: "dnsScreenshot", label: "DNS 设置截图" },
      { key: "processIdScreenshot", label: "Process ID 截图" },
    ];
    const missing = requiredFields.filter(
      ({ key }) => !(basicInfo[key] ?? "").trim(),
    );
    if (missing.length > 0) {
      setStatus(
        `请先填写所有基本信息后再下载报告，尚未填写：${missing
          .map((f) => f.label)
          .join("、")}`,
      );
      return;
    }

    const stats = computeReportStats(testCases, results);
    if (
      stats.completionRate < 100 &&
      !window.confirm(
        `目前仍有 ${stats.unfilled} 个测试案例尚未填写，是否仍要下载报告？`,
      )
    ) {
      return;
    }

    const report: TestReport = {
      title: APP_TITLE,
      basicInfo,
      testCases,
      results,
      attachmentInfo,
      generatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
      testCaseMeta,
      testVersionLinks: TEST_VERSION_LINKS,
    };
    const html = generateReportHtml(report);
    const location = basicInfo.location.trim() || "未填写地区";
    const testDate = formatDateForFilename(basicInfo.testDate);
    const filename = `${sanitizeFilename(
      `${APP_TITLE}_${location}_${testDate}`,
    )}.html`;
    downloadHtml(html, filename);
    setStatus("报告已下载");
  };

  return (
    <section className="card">
      <h2 className="section-title">草稿与报告</h2>
      <div className="button-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSave}
        >
          储存草稿
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleLoad}
        >
          载入草稿
        </button>
        <button type="button" className="btn btn-danger" onClick={handleClear}>
          清除草稿
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownload}
        >
          下载 HTML 报告
        </button>
      </div>
      {status && <p className="action-status">{status}</p>}
    </section>
  );
}
