import type { TestVersionLinks } from "../types/report";

/**
 * Download links for the build under test, maintained by QA.
 * Leave a value empty to show a "not configured yet" message.
 * After updating these, rebuild and redeploy.
 */
export const TEST_VERSION_LINKS: TestVersionLinks = {
  apk: "",
  ios: "",
};
