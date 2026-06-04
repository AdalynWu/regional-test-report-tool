import type { TestReportDraft } from "../../types/report";

const BASE_DRAFT_KEY = "regional-test-report-draft";

/**
 * Draft key per project (and optional scope, e.g. payment method) so projects —
 * and the payment project's alipay / wechat drafts — never overwrite each other.
 */
export function getDraftKey(projectId: string, scope?: string): string {
  const base = `${BASE_DRAFT_KEY}:${projectId}`;
  return scope ? `${base}:${scope}` : base;
}

/** Persist the current draft to localStorage. */
export function saveDraft(
  projectId: string,
  draft: TestReportDraft,
  scope?: string,
): void {
  try {
    localStorage.setItem(getDraftKey(projectId, scope), JSON.stringify(draft));
  } catch {
    // Ignore quota / serialization errors — drafting is best-effort.
  }
}

/** Load a previously saved draft, or null if none / unreadable. */
export function loadDraft(
  projectId: string,
  scope?: string,
): TestReportDraft | null {
  try {
    const raw = localStorage.getItem(getDraftKey(projectId, scope));
    if (!raw) return null;
    return JSON.parse(raw) as TestReportDraft;
  } catch {
    return null;
  }
}

/** Remove a saved draft. */
export function clearDraft(projectId: string, scope?: string): void {
  try {
    localStorage.removeItem(getDraftKey(projectId, scope));
  } catch {
    // Ignore.
  }
}
