import type { TestReportDraft } from "../../types/report";

const STORAGE_KEY = "regional-test-report-draft";

/** Persist the current draft to localStorage. */
export function saveDraft(draft: TestReportDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / serialization errors — drafting is best-effort.
  }
}

/** Load a previously saved draft, or null if none / unreadable. */
export function loadDraft(): TestReportDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TestReportDraft;
  } catch {
    return null;
  }
}

/** Remove any saved draft. */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
