import type { ReactNode } from "react";

/**
 * Each instruction is a ReactNode, so individual words can be highlighted by
 * wrapping them in a <span> with a highlight class (e.g. "hl-danger").
 */
const INSTRUCTIONS: ReactNode[] = [
  <>請分別測試 android 以及 iOS 至少各一次</>,
  <>
    测试时，请使用第二只手机或是第三方录影工具，
    <span className="hl-danger">不要使用裝置直接螢幕錄影</span>
    。录制测试过程的完整影片，画面需清晰且包含整支手机画面
  </>,
  <>
    请在剛進入 app 時先截图提供本次测试的Process
    ID，以作为该次测试流程的唯一识别
    <span className="hl-danger">
      若未提供当次 Process ID，该次测试将视为无效
    </span>
  </>,
  "请盡量前往「@qa_automation_test_3, @swag, qacreator01, @dogtest003」的页面进行所有的解锁行为。若以上帐号皆未有测试资源，则请找最便宜的钻石数量进行解锁",
  <>
    测试完成后，.har檔案務必先下載完成，才能關閉Ramen App，
    <span className="hl-danger">否则会将不予给薪</span>
  </>,
  "测试影片需放在 google 云端，并要开权限让测试人员查看",
  "请在当日完成测试并填写文件及上传相关档案，若当日无法完成请提前告知",
  "若是有任何问题或是遇到严重 bug，请立即回报再相关微信群中以利技术排查",
  "截图会被内嵌进最终 HTML 报告，但也需同步上传到 Google Drive 资料夹中",
  "完成后请自行下载 HTML 报告，并上传至指定 Google Drive 资料夹",
  "此工具不会自动上传资料，请自行保存报告",
];

/** Static usage instructions shown at the top of the page. */
export function InstructionCard() {
  return (
    <section className="card instruction-card">
      <h2 className="section-title">使用说明</h2>
      <ul className="instruction-list">
        {INSTRUCTIONS.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
