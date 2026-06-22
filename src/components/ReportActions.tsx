import { useState } from "react";
import dayjs from "dayjs";
import type {
  AttachmentInfo,
  BasicInfo,
  Platform,
  PlatformData,
  TestCase,
  TestCaseMeta,
  TestReport,
  TestReportDraft,
  TestResult,
} from "../types/report";
import { clearDraft, loadDraft } from "../features/report/reportStorage";
import { generateReportHtml } from "../features/report/generateReportHtml";
import { downloadHtml } from "../features/report/downloadHtml";
import { computeReportStats } from "../features/report/reportStats";
import { platformLabel, type ProjectConfig } from "../config/projects";

interface ReportActionsProps {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
  testCases: TestCase[];
  testCaseMeta?: TestCaseMeta;
  project: ProjectConfig;
  draftScope?: string;
  testDomainUrl?: string;
  dualPlatform?: boolean;
  platforms?: Record<Platform, PlatformData>;
  onSaveDraft: () => void;
  onLoadDraft: (draft: TestReportDraft) => void;
}

const PLATFORM_ORDER: Platform[] = ["android", "ios"];

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
  project,
  draftScope,
  testDomainUrl,
  dualPlatform,
  platforms,
  onSaveDraft,
  onLoadDraft,
}: ReportActionsProps) {
  const [status, setStatus] = useState("");

  const handleSave = () => {
    onSaveDraft();
    setStatus("草稿已保存");
  };

  const handleLoad = () => {
    const draft = loadDraft(project.id, draftScope);
    if (!draft) {
      setStatus("没有草稿");
      return;
    }
    onLoadDraft(draft);
    setStatus("草稿已载入");
  };

  const handleClear = () => {
    if (!window.confirm("确定要清除草稿吗？此操作无法复原。")) return;
    clearDraft(project.id, draftScope);
    setStatus("草稿已清除");
  };

  /** Required basic-info / screenshot fields missing for a given platform. */
  const missingFieldsFor = (
    platform: Platform | null,
    info: BasicInfo,
  ): string[] => {
    const screenshotFields = (project.environmentScreenshotFields ?? []).filter(
      // iOS does not collect Android-only screenshots (e.g. Process ID).
      (f) => !(platform === "ios" && f.androidOnly),
    );
    const required: { key: keyof BasicInfo; label: string }[] = [
      ...project.basicInfoFields,
      ...screenshotFields,
    ]
      .filter((f) => f.required)
      .map((f) => ({ key: f.key, label: f.label }));
    return required
      .filter(({ key }) => !(info[key] ?? "").trim())
      .map((f) => f.label);
  };

  const handleDownload = () => {
    const dual = !!dualPlatform && !!platforms;

    // Block until every required field is filled (per platform when dual).
    if (dual && platforms) {
      const parts = PLATFORM_ORDER.map((p) => {
        const missing = missingFieldsFor(p, platforms[p].basicInfo);
        return missing.length
          ? `${platformLabel(p)}: ${missing.join("、")}`
          : "";
      }).filter(Boolean);
      if (parts.length > 0) {
        setStatus(`请先填写所有基本信息后再下载报告，尚未填写 → ${parts.join("；")}`);
        return;
      }
    } else {
      const missing = missingFieldsFor(null, basicInfo);
      if (missing.length > 0) {
        setStatus(
          `请先填写所有基本信息后再下载报告，尚未填写：${missing.join("、")}`,
        );
        return;
      }
    }

    // Completion gating (per platform when dual).
    if (dual && platforms) {
      const incomplete = PLATFORM_ORDER.map((p) => {
        const stats = computeReportStats(testCases, platforms[p].results);
        return stats.completionRate < 100
          ? `${platformLabel(p)} ${stats.unfilled} 个`
          : "";
      }).filter(Boolean);
      if (
        incomplete.length > 0 &&
        !window.confirm(
          `目前仍有测试案例尚未填写（${incomplete.join("、")}），是否仍要下载报告？`,
        )
      ) {
        return;
      }
    } else {
      const stats = computeReportStats(testCases, results);
      if (
        stats.completionRate < 100 &&
        !window.confirm(
          `目前仍有 ${stats.unfilled} 个测试案例尚未填写，是否仍要下载报告？`,
        )
      ) {
        return;
      }
    }

    const report: TestReport = {
      title: project.title,
      basicInfo: dual && platforms ? platforms.android.basicInfo : basicInfo,
      testCases,
      results: dual && platforms ? platforms.android.results : results,
      attachmentInfo,
      generatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
      testCaseMeta,
      testVersionLinks: project.testVersionLinks,
      showVersionDownloadSection: project.showVersionDownloadSection,
      testDomainUrl,
      platformsReport:
        dual && platforms
          ? PLATFORM_ORDER.map((p) => ({
              id: p,
              label: platformLabel(p),
              basicInfo: platforms[p].basicInfo,
              results: platforms[p].results,
            }))
          : undefined,
    };
    const html = generateReportHtml(report);
    const location =
      (dual && platforms ? platforms.android.basicInfo.location : basicInfo.location)
        .trim() || "未填写地区";
    const testDate = formatDateForFilename(
      dual && platforms ? platforms.android.basicInfo.testDate : basicInfo.testDate,
    );
    const filename = `${sanitizeFilename(
      `${project.title}_${location}_${testDate}`,
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
