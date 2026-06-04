interface TestDomainSectionProps {
  url: string;
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

/** QA-maintained test URL (e.g. nav-site「測試網址」). */
export function TestDomainSection({ url }: TestDomainSectionProps) {
  const trimmed = url.trim();
  let content;
  if (!trimmed) {
    content = <span className="version-empty">尚未設定测试网址</span>;
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
    <section className="card version-section">
      <h2 className="section-title">测试网址</h2>
      <div className="version-row">
        <span className="version-label">测试网址</span>
        <span className="version-value">{content}</span>
      </div>
    </section>
  );
}
