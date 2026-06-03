import { useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  TestCase,
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

interface ReportActionsProps {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
  testCases: TestCase[];
  onLoadDraft: (draft: TestReportDraft) => void;
}

const REPORT_TITLE = "Ramen 测试报告";

/** Make a string safe for use in a filename. */
function sanitizeForFilename(value: string, fallback: string): string {
  const cleaned = (value ?? "")
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

export function ReportActions({
  basicInfo,
  results,
  attachmentInfo,
  testCases,
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
    const requiredFields: (keyof BasicInfo)[] = [
      "testerName",
      "testDate",
      "deviceModel",
      "osVersion",
      "location",
      "appVersion",
    ];
    const hasMissing = requiredFields.some(
      (field) => !(basicInfo[field] ?? "").trim(),
    );
    if (
      hasMissing &&
      !window.confirm("部分基本信息尚未填写，是否仍要下载报告？")
    ) {
      return;
    }

    const report: TestReport = {
      title: REPORT_TITLE,
      basicInfo,
      testCases,
      results,
      attachmentInfo,
      generatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
    };
    const html = generateReportHtml(report);
    const location = sanitizeForFilename(basicInfo.location, "unknown");
    const device = sanitizeForFilename(basicInfo.deviceModel, "device");
    const stamp = dayjs().format("YYYYMMDD-HHmm");
    const filename = `ramen-test-report-${location}-${device}-${stamp}.html`;
    downloadHtml(html, filename);
    setStatus("报告已下载");
  };

  return (
    <section className="card">
      <h2 className="section-title">草稿与报告</h2>
      <div className="button-bar">
        <button type="button" className="btn btn-secondary" onClick={handleSave}>
          储存草稿
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleLoad}>
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
