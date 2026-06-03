export type TestStatus =
  | "pass"
  | "fail"
  | "blocked"
  | "not_tested"
  | "need_confirm";

export interface TestCase {
  id: string;
  category: string;
  item: string;
  requirement: string;
  stepsAndExpected: string;
  note?: string;
  needScreenshot?: boolean;
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
}
