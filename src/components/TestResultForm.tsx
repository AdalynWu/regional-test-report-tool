import { useState } from "react";
import type { ChangeEvent } from "react";
import type { TestResult, TestStatus } from "../types/report";
import { fileToBase64 } from "../utils/fileToBase64";
import { ImagePreviewDialog } from "./ImagePreviewDialog";

function isImageDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

interface TestResultFormProps {
  caseId: string;
  value?: TestResult;
  onChange: (result: TestResult) => void;
}

const STATUS_OPTIONS: { value: TestStatus; label: string }[] = [
  { value: "not_tested", label: "未测试" },
  { value: "pass", label: "通过" },
  { value: "fail", label: "失败" },
  { value: "blocked", label: "受阻" },
  { value: "need_confirm", label: "待确认" },
];

function emptyResult(caseId: string): TestResult {
  return {
    caseId,
    status: "not_tested",
    actualResult: "",
    waitingTime: "",
    screenshots: [],
    note: "",
  };
}

export function TestResultForm({ caseId, value, onChange }: TestResultFormProps) {
  const current = value ?? emptyResult(caseId);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const openPreview = (src: string | undefined) => {
    if (isImageDataUrl(src)) setPreviewSrc(src);
  };

  const patch = (partial: Partial<TestResult>) => {
    onChange({ ...current, ...partial, caseId });
  };

  const handleScreenshots = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const base64List = await Promise.all(
      Array.from(files).map((file) => fileToBase64(file)),
    );
    patch({ screenshots: [...current.screenshots, ...base64List] });
    event.target.value = "";
  };

  const removeScreenshot = (index: number) => {
    patch({
      screenshots: current.screenshots.filter((_, i) => i !== index),
    });
  };

  const showActualResultHint =
    (current.status === "fail" || current.status === "blocked") &&
    !current.actualResult.trim();

  return (
    <div className="result-form">
      <div className="field-grid">
        <label className="field">
          <span className="field-label">测试结果</span>
          <select
            value={current.status}
            onChange={(e) => patch({ status: e.target.value as TestStatus })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">等待时间</span>
          <input
            type="text"
            value={current.waitingTime ?? ""}
            placeholder="例如：3秒，影片时间点 00:12~00:15"
            onChange={(e) => patch({ waitingTime: e.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">实际结果</span>
        <textarea
          value={current.actualResult}
          onChange={(e) => patch({ actualResult: e.target.value })}
        />
        {showActualResultHint && (
          <p className="field-hint">
            Fail / Blocked 状态建议填写实际结果或问题描述
          </p>
        )}
      </label>

      <label className="field">
        <span className="field-label">备注</span>
        <textarea
          value={current.note ?? ""}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </label>

      <div className="field">
        <span className="field-label">截图（可多选）</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => void handleScreenshots(e)}
        />
        {current.screenshots.length > 0 && (
          <div className="thumb-row">
            {current.screenshots.map((src, index) => (
              <div key={index} className="env-thumb">
                <button
                  type="button"
                  className="env-thumb-image"
                  onClick={() => openPreview(src)}
                  title="点击预览"
                >
                  <img src={src} alt={`截图 ${index + 1}`} />
                  <span className="env-thumb-hint">点击预览</span>
                </button>
                <button
                  type="button"
                  className="thumb-remove"
                  onClick={() => removeScreenshot(index)}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImagePreviewDialog
        imageSrc={previewSrc}
        open={previewSrc !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewSrc(null);
        }}
      />
    </div>
  );
}
