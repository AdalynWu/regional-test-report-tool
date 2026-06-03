import type { TestVersionLinks } from "../types/report";

/**
 * Download links for the build under test, maintained by QA.
 * Leave a value empty to show a "not configured yet" message.
 * After updating these, rebuild and redeploy.
 */
export const TEST_VERSION_LINKS: TestVersionLinks = {
  apk: "https://drive.google.com/file/d/1RvA6rvPTCoLj5kfm1u3uH75rGhhXs_n-/view?usp=drive_link",
  ios: "https://sw.agtheapp.com/",
};
