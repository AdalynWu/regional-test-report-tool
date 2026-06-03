import { useState } from "react";

const CHECKLIST_ITEMS = [
  "已移除旧版 App 并重新安装",
  "已关闭 VPN",
  "设备电量高于 25%",
  "未开启省电模式",
  "已完成网速测试并截图",
  "已截图 DNS 设置",
  "已截图 Process ID",
  "已开始全程录影",
  "已确认 .har 档案可以下载",
];

/**
 * Pre-test checklist. State is local-only by design (Phase 1) — it is not
 * lifted into the report draft.
 */
export function PreTestChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (item: string) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <section className="card">
      <h2 className="section-title">测试前检查清单</h2>
      <ul className="checklist">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item}>
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={checked[item] ?? false}
                onChange={() => toggle(item)}
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
