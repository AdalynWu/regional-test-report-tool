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
  dnsSetting?: string;
  downloadSpeed?: string;
  uploadSpeed?: string;
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
  harFileUrl?: string;
  extraNote?: string;
}

export interface TestReportDraft {
  basicInfo: BasicInfo;
  results: Record<string, TestResult>;
  attachmentInfo: AttachmentInfo;
}
