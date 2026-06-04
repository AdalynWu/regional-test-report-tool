import { useState } from "react";
import type { ChangeEvent } from "react";
import type { BasicInfo } from "../types/report";
import { fileToBase64 } from "../utils/fileToBase64";
import { HelpTooltip } from "./HelpTooltip";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { FileUploadButton } from "./FileUploadButton";

interface BasicInfoFormProps {
  value: BasicInfo;
  onChange: (next: BasicInfo) => void;
}

const DNS_TOOLTIP =
  "WiFi: \n" +
  "1. 进入手机的 「设定」 -> 「Wi-Fi」\n" +
  "2. 点击当前连线 Wi-Fi 旁边的 「i」图示 (iOS) 或 「进阶设定」 (Android)\n" +
  " 3. 找到 「设定 DNS」 或 「DNS」 选项 \n" +
  "4. 请截图该页面，确保能看到 DNS 地址（例如：192.168.1.1 或 114.114.114.114）\n" +
  "\n" +
  " 4G/5G: \n" +
  "1. 关闭 Wi-Fi，确保手机显示为 4G/5G 连线。\n" +
  "2. 开启手机浏览器，进入 https://ip.skk.moe/ 或 https://browserleaks.com/dns。\n" +
  "3. 等待页面加载完成，找到 「DNS 解析伺服器」 或 「DNS Leak Test」 区块。\n" +
  "4. 请截图该页面，确保能看到 DNS 地址（例如：192.168.1.1 或 114.114.114.114）。";
const osVersionTooltip = "打开 App 后，便会显示在画面底部";
// const ISP_TOOLTIP =
//   "请填写当前网络服务商，例如中国移动、中国联通、中国电信，或实际使用的宽带服务商。";
const SPEED_TOOLTIP =
  "请使用测速工具记录本次测试环境的下载与上传速度，并上传测速截图。";
const PROCESS_ID_TOOLTIP =
  "打开 App 后，直接点击 Frontend Domain Input 弹窗的 Confirm 按钮后，便会显示在画面底部";

/** Text fields rendered in order, with their labels. */
const TEXT_FIELDS: {
  key: keyof BasicInfo;
  label: string;
  placeholder?: string;
  tooltip?: string;
}[] = [
  { key: "testerName", label: "测试人员", placeholder: "例如：上海" },
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
    tooltip: osVersionTooltip,
  },
  {
    key: "location",
    label: "测试地区(请精确到区)",
    placeholder: "例如：上海市静安区",
  },
  { key: "appVersion", label: "App 版本", placeholder: "例如：1.0.22-dev.1" },
  {
    key: "isp",
    label: "电信业者 / ISP",
    placeholder: "例如：中国电信 / 中国联通 / 中国移动	",
  },
  {
    key: "networkType",
    label: "网络类型",
    placeholder: "例如：Wi-Fi / 5G",
  },
];

/** Screenshot fields stored as base64 data URLs. */
const SCREENSHOT_FIELDS: {
  key: keyof BasicInfo;
  label: string;
  tooltip?: string;
}[] = [
  {
    key: "networkScreenshot",
    label: "网速测试截图 (建议用 Speedtest.cn)",
    tooltip: SPEED_TOOLTIP,
  },
  { key: "dnsScreenshot", label: "DNS 设置截图", tooltip: DNS_TOOLTIP },
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
    // Allow re-selecting the same file later (display name is tracked above).
    event.target.value = "";
  };

  const removeScreenshot = (field: keyof BasicInfo) => {
    setFileNames((prev) => ({ ...prev, [field]: "" }));
    update(field, undefined);
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
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              {tooltip && <HelpTooltip text={tooltip} />}
            </span>
            <input
              type={key === "testDate" ? "date" : "text"}
              value={(value[key] as string | undefined) ?? ""}
              placeholder={placeholder}
              required
              aria-required="true"
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
                <span className="required-mark" aria-hidden="true">
                  *
                </span>
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
