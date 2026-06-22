export type TestStatus =
  | "pass"
  | "fail"
  | "blocked"
  | "not_tested"
  | "need_confirm";

export type PaymentMethod = "alipay" | "wechat";

export type Platform = "android" | "ios";

export interface PlatformData {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
}

export interface TestCase {
  id: string;
  category: string;
  item: string;
  requirement: string;
  stepsAndExpected: string;
  note?: string;
  needScreenshot?: boolean;
  /** Payment project only: which payment method this case applies to. */
  paymentMethod?: PaymentMethod | "all";
}

export interface BasicInfo {
  testerName: string;
  testDate: string;
  testAccount: string;
  deviceModel: string;
  osVersion: string;
  location: string;
  appVersion: string;
  isp?: string;
  networkType?: string;
  networkScreenshot?: string;
  dnsScreenshot?: string;
  processIdScreenshot?: string;
  /** nav-site project */
  iosDeviceInfo?: string;
  androidDeviceInfo?: string;
  /** payment project */
  paymentMethod?: PaymentMethod;
}

export interface TestResult {
  caseId: string;
  status: TestStatus;
  actualResult: string;
  waitingTime?: string;
  screenshots: string[];
  note?: string;
}

export interface AttachmentInfo {
  recordingUrl?: string;
  testFolderUrl?: string;
  extraNote?: string;
}

export interface TestCaseMeta {
  sourceName: string;
  loadedAt: string;
  totalCases: number;
}

export interface TestVersionLinks {
  apk: string;
  ios: string;
}

export interface TestReportDraft {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
  /** Dual-platform projects (e.g. ramen) store both platforms here. */
  platforms?: Record<Platform, PlatformData>;
}

export interface TestReport {
  title: string;
  basicInfo: BasicInfo;
  testCases: TestCase[];
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
  generatedAt: string;
  testCaseMeta?: TestCaseMeta;
  testVersionLinks?: TestVersionLinks;
  /** When false, the report omits the version-download section. */
  showVersionDownloadSection?: boolean;
  /** Test URL for projects that use one (e.g. nav-site). */
  testDomainUrl?: string;
  /** When present, the report renders both platforms (e.g. ramen Android + iOS). */
  platformsReport?: Array<{
    id: Platform;
    label: string;
    basicInfo: BasicInfo;
    results: Record<string, TestResult>;
    attachmentInfo: AttachmentInfo;
  }>;
}
