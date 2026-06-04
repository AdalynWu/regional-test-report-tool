import { useState } from "react";
import type { ChangeEvent } from "react";
import type { BasicInfo } from "../types/report";
import type {
  BasicInfoFieldConfig,
  EnvironmentScreenshotFieldConfig,
} from "../config/projects";
import { fileToBase64 } from "../utils/fileToBase64";
import { HelpTooltip } from "./HelpTooltip";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { FileUploadButton } from "./FileUploadButton";
import { SelectMenu } from "./SelectMenu";

interface BasicInfoFormProps {
  value: BasicInfo;
  fields: BasicInfoFieldConfig[];
  environmentScreenshotFields?: EnvironmentScreenshotFieldConfig[];
  onChange: (next: BasicInfo) => void;
}

function isImageDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

export function BasicInfoForm({
  value,
  fields,
  environmentScreenshotFields,
  onChange,
}: BasicInfoFormProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const update = (field: keyof BasicInfo, fieldValue: string | undefined) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleScreenshot = async (
    field: keyof BasicInfo,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setFileNames((prev) => ({ ...prev, [field]: file.name }));
    update(field, base64);
    event.target.value = "";
  };

  const removeScreenshot = (field: keyof BasicInfo) => {
    setFileNames((prev) => ({ ...prev, [field]: "" }));
    update(field, undefined);
  };

  const openPreview = (src: string | undefined) => {
    if (isImageDataUrl(src)) setPreviewSrc(src);
  };

  const hasScreenshots =
    environmentScreenshotFields != null && environmentScreenshotFields.length > 0;

  return (
    <section className="card">
      <h2 className="section-title">基本信息</h2>

      <div className="field-grid">
        {fields.map((field) => {
          const current = (value[field.key] as string | undefined) ?? "";
          const labelContent = (
            <span className="field-label">
              {field.label}
              {field.required && (
                <span className="required-mark" aria-hidden="true">
                  *
                </span>
              )}
              {field.tooltip && <HelpTooltip text={field.tooltip} />}
            </span>
          );

          // Custom dropdown lives in a <div> (not <label>) so clicking the label
          // area doesn't toggle the trigger button.
          if (field.type === "select") {
            return (
              <div key={field.key} className="field">
                {labelContent}
                <SelectMenu
                  value={current}
                  options={field.options ?? []}
                  ariaLabel={field.label}
                  onChange={(v) => update(field.key, v)}
                />
              </div>
            );
          }

          return (
            <label key={field.key} className="field">
              {labelContent}
              <input
                type={field.type === "date" ? "date" : "text"}
                value={current}
                placeholder={field.placeholder}
                required={field.required}
                aria-required={field.required}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </label>
          );
        })}
      </div>

      {hasScreenshots && (
        <div className="screenshot-grid">
          {environmentScreenshotFields.map(({ key, label, required, tooltip }) => {
            const current = value[key] as string | undefined;
            return (
              <div key={key} className="field">
                <span className="field-label">
                  {label}
                  {required && (
                    <span className="required-mark" aria-hidden="true">
                      *
                    </span>
                  )}
                  {tooltip && <HelpTooltip text={tooltip} />}
                </span>
                <FileUploadButton
                  accept="image/*"
                  fileName={fileNames[key]}
                  onChange={(e) => void handleScreenshot(key, e)}
                />
                {isImageDataUrl(current) && (
                  <div className="thumb-row">
                    <div className="env-thumb">
                      <button
                        type="button"
                        className="env-thumb-image"
                        onClick={() => openPreview(current)}
                        title="点击预览"
                      >
                        <img src={current} alt={label} />
                        <span className="env-thumb-hint">点击预览</span>
                      </button>
                      <span className="env-thumb-label">{label}</span>
                      <button
                        type="button"
                        className="thumb-remove"
                        onClick={() => removeScreenshot(key)}
                      >
                        移除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ImagePreviewDialog
        imageSrc={previewSrc}
        open={previewSrc !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewSrc(null);
        }}
      />
    </section>
  );
}
