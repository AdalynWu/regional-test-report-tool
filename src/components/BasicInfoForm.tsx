import type { ChangeEvent } from "react";
import type { BasicInfo } from "../types/report";
import { fileToBase64 } from "../utils/fileToBase64";

interface BasicInfoFormProps {
  value: BasicInfo;
  onChange: (next: BasicInfo) => void;
}

/** Text fields rendered in order, with their labels. */
const TEXT_FIELDS: { key: keyof BasicInfo; label: string; placeholder?: string }[] = [
  { key: "testerName", label: "测试人员" },
  { key: "testDate", label: "测试日期" },
  { key: "testAccount", label: "测试帐号" },
  { key: "deviceModel", label: "设备型号", placeholder: "例如：iPhone 15 Pro" },
  { key: "osVersion", label: "系统版本", placeholder: "例如：iOS 17.5" },
  { key: "location", label: "测试地区" },
  { key: "appVersion", label: "App 版本" },
  { key: "isp", label: "电信业者 / ISP" },
  { key: "networkType", label: "网络类型", placeholder: "例如：Wi-Fi / 5G" },
  { key: "dnsSetting", label: "DNS 设置" },
  { key: "downloadSpeed", label: "下载速度", placeholder: "例如：50 Mbps" },
  { key: "uploadSpeed", label: "上传速度", placeholder: "例如：10 Mbps" },
];

/** Screenshot fields stored as base64 data URLs. */
const SCREENSHOT_FIELDS: { key: keyof BasicInfo; label: string }[] = [
  { key: "networkScreenshot", label: "网速测试截图" },
  { key: "dnsScreenshot", label: "DNS 设置截图" },
  { key: "processIdScreenshot", label: "Process ID 截图" },
];

export function BasicInfoForm({ value, onChange }: BasicInfoFormProps) {
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

  return (
    <section className="card">
      <h2 className="section-title">基本信息</h2>

      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="field">
            <span className="field-label">{label}</span>
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
        {SCREENSHOT_FIELDS.map(({ key, label }) => {
          const current = value[key] as string | undefined;
          return (
            <div key={key} className="field">
              <span className="field-label">{label}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void handleScreenshot(key, e)}
              />
              {current && (
                <div className="thumb-row">
                  <div className="thumb">
                    <img src={current} alt={label} />
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
    </section>
  );
}
