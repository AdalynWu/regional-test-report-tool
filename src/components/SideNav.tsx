import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "使用说明", href: "#instructions" },
  { label: "测试案例来源", href: "#test-case-meta" },
  { label: "基本信息", href: "#basic-info" },
  { label: "测试前检查清单", href: "#pre-test-checklist" },
  { label: "本次测试版本下载", href: "#version-download" },
  { label: "测试案例", href: "#test-cases" },
  { label: "附件信息", href: "#attachment" },
  { label: "报告预览", href: "#report-preview" },
];

/** Sticky desktop quick-navigation. Plain anchor links — no router. Collapsible. */
export function SideNav() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={collapsed ? "side-nav collapsed" : "side-nav"}
      aria-label="页面快速导航"
    >
      <div className="side-nav-head">
        {!collapsed && <p className="side-nav-title">快速导航</p>}
        <button
          type="button"
          className="side-nav-toggle"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "展开快速导航" : "收合快速导航"}
          title={collapsed ? "展开" : "收合"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "«" : "»"}
        </button>
      </div>
      {!collapsed && (
        <ul className="side-nav-list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
