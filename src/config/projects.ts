import type { BasicInfo, TestVersionLinks } from "../types/report";

export type ProjectId = "ramen" | "nav-site" | "payment";

export type CaseCategoryMode = "category" | "paymentMethod";

export interface BasicInfoFieldConfig {
  key: keyof BasicInfo;
  label: string;
  type?: "text" | "date" | "select";
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface EnvironmentScreenshotFieldConfig {
  key: "networkScreenshot" | "dnsScreenshot" | "processIdScreenshot";
  label: string;
  required?: boolean;
  tooltip?: string;
}

export interface ProjectConfig {
  id: ProjectId;
  title: string;
  subtitle?: string;
  csvPath: string;
  instructions: string[];
  basicInfoFields: BasicInfoFieldConfig[];
  environmentScreenshotFields?: EnvironmentScreenshotFieldConfig[];
  preTestChecklistItems: string[];
  showVersionDownloadSection: boolean;
  testVersionLinks: TestVersionLinks;
  /** Optional single test URL section (e.g. nav-site「測試網址」). */
  testDomainLinks?: { url: string };
  caseCategoryMode?: CaseCategoryMode;
  filterByPaymentMethod?: boolean;
}

/* ----- shared tooltip texts (mirrors current Ramen BasicInfoForm) ----- */
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
const OS_VERSION_TOOLTIP = "打开 App 后，便会显示在画面底部";
const SPEED_TOOLTIP =
  "请使用测速工具记录本次测试环境的下载与上传速度，并上传测速截图";
const PROCESS_ID_TOOLTIP =
  "打开 App 后，直接点击 Frontend Domain Input 弹窗的 Confirm 按钮后，便会显示在画面底部";
const PAYMENT_METHOD_TOOLTIP =
  "请依照当日指定的款方式选择对应的选项，以确保测试案例的正确过滤与分类";
export const DEFAULT_PROJECT_ID: ProjectId = "ramen";

export const PROJECTS: Record<ProjectId, ProjectConfig> = {
  ramen: {
    id: "ramen",
    title: "Ramen 測試報告",
    subtitle: "填写测试结果并上传截图",
    csvPath: "data/ramen/test-cases.csv",
    showVersionDownloadSection: true,
    caseCategoryMode: "category",
    filterByPaymentMethod: false,
    instructions: [
      "請分別使用 android 以及 iOS 测试{red}各一次{/red}",
      "测试时，请使用第二只手机或是第三方录影工具，{red}不要使用裝置直接萤幕录影{/red}。录制测试过程的完整影片，画面需清晰且包含整支手机画面",
      "请在剛進入 app 時先截图提供本次测试的Process ID，以作为该次测试流程的唯一识别{red}若未提供当次 Process ID，该次测试将视为无效{/red}",
      "请尽量前往「@dogtest003 | @qa_automation_test_3 | @swag | qacreator01 」的页面进行所有的解锁行为。若以上帐号皆未有测试资源，则找{red}最便宜{/red}的钻石数的資源进行解锁",
      "测试完成后，.har 档案务必先下载完成，才能关闭Ramen App，{red}否则会将不予给薪{/red}",
      "测试影片需放在 google 云端資料夾，并要开权限让测试人员查看",
      "请在当日完成测试并填写文件及上传相关档案，若当日无法完成请提前告知",
      "若是有任何问题或是遇到严重 bug，请立即回报在相关微信群中以利技术排查",
      "截图会被内嵌进最终 HTML 报告，但也需{red}同步上传到 Google Drive 资料夹中{/red}",
      "完成后请自行下载 HTML 报告，并上传至指定 Google Drive 资料夹",
      "此工具不会自动上传资料，请自行保存报告",
    ],
    basicInfoFields: [
      {
        key: "testerName",
        label: "测试人员",
        required: true,
        placeholder: "例如：上海",
      },
      { key: "testDate", label: "测试日期", type: "date", required: true },
      {
        key: "testAccount",
        label: "测试帐号/密码",
        required: true,
        placeholder: "例如：cn_user_test/123456",
      },
      {
        key: "deviceModel",
        label: "设备型号",
        required: true,
        placeholder: "例如：iPhone 15 Pro",
      },
      {
        key: "osVersion",
        label: "系统版本",
        required: true,
        placeholder: "例如：iOS 17.5/Android 14",
        tooltip: OS_VERSION_TOOLTIP,
      },
      {
        key: "location",
        label: "测试地区(请精确到区)",
        required: true,
        placeholder: "例如：上海市静安区",
      },
      {
        key: "appVersion",
        label: "App 版本",
        required: true,
        placeholder: "例如：1.0.22-dev.1",
      },
      {
        key: "isp",
        label: "电信业者 / ISP",
        required: true,
        placeholder: "例如：中国电信 / 中国联通 / 中国移动",
      },
      {
        key: "networkType",
        label: "网络类型",
        required: true,
        placeholder: "例如：Wi-Fi / 5G",
      },
    ],
    environmentScreenshotFields: [
      {
        key: "networkScreenshot",
        label: "网速测试截图 (建议用 Speedtest.cn)",
        required: true,
        tooltip: SPEED_TOOLTIP,
      },
      {
        key: "dnsScreenshot",
        label: "DNS 设置截图",
        required: true,
        tooltip: DNS_TOOLTIP,
      },
      {
        key: "processIdScreenshot",
        label: "Process ID 截图",
        required: true,
        tooltip: PROCESS_ID_TOOLTIP,
      },
    ],
    preTestChecklistItems: [
      "已移除前一版 App 并重新安装",
      "已关闭 VPN",
      "设备电量高于 25%",
      "未开启省电模式",
      "已完成网速测试并截图",
      "已截图 DNS 设置",
      "已截图 Process ID",
      "已开始全程录影",
      "已确认 .har 档案可以下载",
    ],
    testVersionLinks: {
      apk: "https://drive.google.com/file/d/1RvA6rvPTCoLj5kfm1u3uH75rGhhXs_n-/view?usp=drive_link",
      ios: "https://sw.agtheapp.com/",
    },
  },

  "nav-site": {
    id: "nav-site",
    title: "導航網測試報告",
    subtitle: "导航页访问测试工具",
    csvPath: "data/nav-site/nav-site-test-cases.csv",
    showVersionDownloadSection: false,
    caseCategoryMode: "category",
    filterByPaymentMethod: false,
    instructions: [
      "請分別使用 android 以及 iOS 测试{red}各一次{/red}",
      "请务必确认基础资讯与环境检测皆已完成",
      "若使用预设浏览器遇到无法访问的情况，请先{red}尝试第二种浏览器{/red}",
      "若仍无法开启，再使用 VPN 确认是否能访问，并立即在群组回报",
      "请务必每次使用{red}无痕模式{/red}进行访问",
      "完成后请自行下载 HTML 报告，并上传至指定 Google Drive 资料夹",
      "测试影片需放在 google 云端資料夾，并要开权限让测试人员查看",
    ],
    basicInfoFields: [
      {
        key: "testerName",
        label: "测试人员",
        placeholder: "例如：上海",
        required: true,
      },
      { key: "testDate", label: "测试日期", type: "date", required: true },
      {
        key: "location",
        label: "测试地区(请精确到区)",
        required: true,
        placeholder: "例如：上海市静安区",
      },
      {
        key: "testAccount",
        label: "测试帐号 / 测试密码",
        required: true,
        placeholder: "例如：cn_user_test/123456",
      },
      {
        key: "iosDeviceInfo",
        label: "iOS 设备信息",
        required: true,
        placeholder: "例如：iPhone 15 Pro / iOS 17.5 / Safari 17",
        tooltip: "请填写本次 iOS 测试设备的型号+系统版本+浏览器信息。",
      },
      {
        key: "androidDeviceInfo",
        label: "Android 设备信息",
        required: true,
        placeholder: "例如：小米 14 / Android 14 / Chrome 114",
        tooltip: "请填写本次 Android 测试设备的型号与系统版本+浏览器信息",
      },
      {
        key: "isp",
        label: "电信商 ISP",
        required: true,
        placeholder: "例如：中国电信 / 中国联通 / 中国移动",
      },
      {
        key: "networkType",
        label: "网络类型",
        required: true,
        placeholder: "例如：Wi-Fi / 5G / 4G",
      },
    ],
    preTestChecklistItems: [
      "已确认测试时电量高于 25%",
      "已确认不处于省电模式",
      "已确认不為一边充电的状况",
      "已重启设备或开关飞行模式，确保 VPN 的关闭，无 VPN 残留路径",
      "已使用无痕模式进行访问",
    ],
    testVersionLinks: { apk: "", ios: "" },
    testDomainLinks: { url: "https://nav-ws-sw.agtheapp.com" },
  },

  payment: {
    id: "payment",
    title: "金流測試報告",
    subtitle: "支付流程测试工具",
    csvPath: "data/payment/payment-test-cases.csv",
    showVersionDownloadSection: false,
    caseCategoryMode: "paymentMethod",
    filterByPaymentMethod: true,
    instructions: [
      "请先完成 Ramen 的例行测试，再使用 Ramen 进行本金流测试",
      "测试时{red}请勿使用 VPN{/red}",
      "请使用测试装置直接进行萤幕录影，或使用另一支手机录影",
      "录影需要清楚拍到跳转支付的过程",
      "请依照{red}当日指定的付款方式与装置{/red}进行测试",
      "测试完毕后请在群组回报，并附上订单 ID、付款纪录、银行帐号以利报帐",
      "完成后请下载 HTML 报告，并上传至指定 Google Drive 资料夹",
    ],
    basicInfoFields: [
      {
        key: "testerName",
        label: "测试人员",
        required: true,
        placeholder: "例如：上海",
      },
      { key: "testDate", label: "测试日期", type: "date", required: true },
      {
        key: "location",
        label: "所在位置",
        required: true,
        placeholder: "例如：上海市静安区",
      },
      {
        key: "testAccount",
        label: "测试帐号 / 测试密码",
        required: true,
        placeholder: "例如：cn_user_test/123456",
      },
      {
        key: "deviceModel",
        label: "设备型号",
        required: true,
        placeholder: "例如：小米 14",
      },
      {
        key: "osVersion",
        label: "OS 版本",
        required: true,
        placeholder: "例如：Android 14",
      },
      {
        key: "paymentMethod",
        label: "付款方式",
        type: "select",
        required: true,
        tooltip: PAYMENT_METHOD_TOOLTIP,
        options: [
          { label: "支付宝", value: "alipay" },
          { label: "微信", value: "wechat" },
        ],
      },
    ],
    preTestChecklistItems: [
      "已确认当日指定付款方式",
      "已确认指定测试装置",
      "已确认登录测试帐号",
    ],
    testVersionLinks: { apk: "", ios: "" },
  },
};

export function getProjectConfig(projectId: string | null): ProjectConfig {
  if (
    projectId === "ramen" ||
    projectId === "nav-site" ||
    projectId === "payment"
  ) {
    return PROJECTS[projectId];
  }
  return PROJECTS[DEFAULT_PROJECT_ID];
}
