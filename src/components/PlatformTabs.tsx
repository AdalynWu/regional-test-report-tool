import type { Platform } from "../types/report";
import { platformLabel } from "../config/projects";

interface PlatformTabsProps {
  active: Platform;
  onChange: (platform: Platform) => void;
}

const PLATFORMS: Platform[] = ["android", "ios"];

/** Android / iOS switch for dual-platform projects. */
export function PlatformTabs({ active, onChange }: PlatformTabsProps) {
  return (
    <section className="card platform-tabs-card">
      <div className="platform-tabs" role="tablist" aria-label="测试平台">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={active === platform}
            className={`platform-tab${active === platform ? " is-active" : ""}`}
            onClick={() => onChange(platform)}
          >
            {platformLabel(platform)}
          </button>
        ))}
      </div>
      <p className="platform-tabs-hint">
        当前填写：<strong>{platformLabel(active)}</strong>
        ，切换分页可分别填写 Android 与 iOS，共用信息会自动同步。
      </p>
    </section>
  );
}
