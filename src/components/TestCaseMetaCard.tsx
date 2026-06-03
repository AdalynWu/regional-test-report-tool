import type { TestCaseMeta } from "../types/report";

interface TestCaseMetaCardProps {
  meta: TestCaseMeta;
}

/** Shows where the test cases came from, when they were loaded, and how many. */
export function TestCaseMetaCard({ meta }: TestCaseMetaCardProps) {
  return (
    <section className="card meta-card">
      <h2 className="section-title">测试案例信息</h2>
      <div className="meta-grid">
        <div className="info-row">
          <span className="info-label">测试案例来源</span>
          <span>{meta.sourceName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">载入时间</span>
          <span>{meta.loadedAt}</span>
        </div>
        <div className="info-row">
          <span className="info-label">测试案例总数</span>
          <span>{meta.totalCases}</span>
        </div>
      </div>
    </section>
  );
}
