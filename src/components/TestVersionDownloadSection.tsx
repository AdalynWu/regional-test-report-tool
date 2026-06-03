import { TEST_VERSION_LINKS } from "../config/testVersionLinks";
import { HelpTooltip } from "./HelpTooltip";

const TOOLTIP_TEXT =
  "请先清除前一次安装的 App / 旧版本文件，再重新下载本次测试版本，避免旧版缓存影响测试结果。";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

interface VersionRowProps {
  label: string;
  url: string;
  emptyText: string;
}

function VersionRow({ label, url, emptyText }: VersionRowProps) {
  const trimmed = url.trim();
  let content;
  if (!trimmed) {
    content = <span className="version-empty">{emptyText}</span>;
  } else if (isHttpUrl(trimmed)) {
    content = (
      <a href={trimmed} target="_blank" rel="noopener noreferrer">
        {trimmed}
      </a>
    );
  } else {
    content = <span>{trimmed}</span>;
  }

  return (
    <div className="version-row">
      <span className="version-label">
        {label}
        <HelpTooltip text={TOOLTIP_TEXT} />
      </span>
      <span className="version-value">{content}</span>
    </div>
  );
}

/** QA-maintained download links for the build under test. */
export function TestVersionDownloadSection() {
  return (
    <section className="card version-section">
      <h2 className="section-title">本次测试版本下载</h2>
      <VersionRow
        label="Android APK"
        url={TEST_VERSION_LINKS.apk}
        emptyText="尚未設定 Android APK 下载连结"
      />
      <VersionRow
        label="iOS"
        url={TEST_VERSION_LINKS.ios}
        emptyText="尚未設定 iOS 下载连结"
      />
    </section>
  );
}
