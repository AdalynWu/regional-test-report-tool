import { useState } from "react";
import type { ChangeEvent } from "react";
import type { BasicInfo } from "../types/report";
import { fileToBase64 } from "../utils/fileToBase64";
import { HelpTooltip } from "./HelpTooltip";
import { ImagePreviewDialog } from "./ImagePreviewDialog";

interface BasicInfoFormProps {
  value: BasicInfo;
  onChange: (next: BasicInfo) => void;
}

const DNS_TOOLTIP =
  "请提供当前设备或网络的 DNS 设置截图。Android 可在 Wi-Fi 详情中查看；iOS 可在 Wi-Fi 信息中查看 DNS。若无法取得，请在备注中说明。";
const NETWORK_TOOLTIP =
  "请填写本次测试使用的网络，例如 Wi-Fi、4G、5G、宽带热点等。";
const ISP_TOOLTIP =
  "请填写当前网络服务商，例如中国移动、中国联通、中国电信，或实际使用的宽带服务商。";
const SPEED_TOOLTIP =
  "请使用测速工具记录本次测试环境的下载与上传速度，并上传测速截图。";
const PROCESS_ID_TOOLTIP =
  "请依照测试说明提供本次测试的 Process ID 截图，用于确认测试环境与测试进程。";

/** Text fields rendered in order, with their labels. */
const TEXT_FIELDS: {
  key: keyof BasicInfo;
  label: string;
  placeholder?: string;
  tooltip?: string;
}[] = [
  { key: "testerName", label: "测试人员" },
  { key: "testDate", label: "测试日期" },
  {
    key: "testAccount",
    label: "测试帐号/密码",
    placeholder: "例如：cn_user_test/123456",
  },
  { key: "deviceModel", label: "设备型号", placeholder: "例如：iPhone 15 Pro" },
  {
    key: "osVersion",
    label: "系统版本",
    placeholder: "例如：iOS 17.5/Android 14",
  },
  {
    key: "location",
    label: "测试地区(请精确到区)",
    placeholder: "例如：上海市静安区",
  },
  { key: "appVersion", label: "App 版本" },
  {
    key: "isp",
    label: "电信业者 / ISP",
    placeholder: "例如：中国电信 / 中国联通 / 中国移动	",
    tooltip: ISP_TOOLTIP,
  },
  {
    key: "networkType",
    label: "网络类型",
    placeholder: "例如：Wi-Fi / 5G",
    tooltip: NETWORK_TOOLTIP,
  },
  { key: "dnsSetting", label: "DNS 设置", tooltip: DNS_TOOLTIP },
  {
    key: "downloadSpeed",
    label: "下载速度",
    placeholder: "例如：50 Mbps",
    tooltip: SPEED_TOOLTIP,
  },
  {
    key: "uploadSpeed",
    label: "上传速度",
    placeholder: "例如：10 Mbps",
    tooltip: SPEED_TOOLTIP,
  },
];

/** Screenshot fields stored as base64 data URLs. */
const SCREENSHOT_FIELDS: {
  key: keyof BasicInfo;
  label: string;
  tooltip?: string;
}[] = [
  { key: "networkScreenshot", label: "网速测试截图" },
  { key: "dnsScreenshot", label: "DNS 设置截图" },
  {
    key: "processIdScreenshot",
    label: "Process ID 截图",
    tooltip: PROCESS_ID_TOOLTIP,
  },
];

function isImageDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

export function BasicInfoForm({ value, onChange }: BasicInfoFormProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

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
    update(field, base64);
    // Allow re-selecting the same file later.
    event.target.value = "";
  };

  const openPreview = (src: string | undefined) => {
    if (isImageDataUrl(src)) setPreviewSrc(src);
  };

  return (
    <section className="card">
      <h2 className="section-title">基本信息</h2>

      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label, placeholder, tooltip }) => (
          <label key={key} className="field">
            <span className="field-label">
              {label}
              {tooltip && <HelpTooltip text={tooltip} />}
            </span>
            <input
              type={key === "testDate" ? "date" : "text"}
              value={(value[key] as string | undefined) ?? ""}
              placeholder={placeholder}
              onChange={(e) => update(key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="screenshot-grid">
        {SCREENSHOT_FIELDS.map(({ key, label, tooltip }) => {
          const current = value[key] as string | undefined;
          return (
            <div key={key} className="field">
              <span className="field-label">
                {label}
                {tooltip && <HelpTooltip text={tooltip} />}
              </span>
              <input
                type="file"
                accept="image/*"
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
                      onClick={() => update(key, undefined)}
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
