const INSTRUCTIONS = [
  "请先确认已安装正确版本 App。",
  "请依照测试案例逐项填写。",
  "截图会被内嵌进最终 HTML 报告。",
  "完成后请下载 HTML 报告，并上传至指定 Google Drive。",
  "此工具不会自动上传资料，请自行保存报告。",
];

/** Static usage instructions shown at the top of the page. */
export function InstructionCard() {
  return (
    <section className="card instruction-card">
      <h2 className="section-title">使用说明</h2>
      <ul className="instruction-list">
        {INSTRUCTIONS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
