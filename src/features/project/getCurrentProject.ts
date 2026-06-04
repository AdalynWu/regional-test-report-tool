import { getProjectConfig, type ProjectConfig } from "../../config/projects";

/**
 * Resolve the active project from the URL query (?project=…).
 * Invalid / missing values fall back to the default project.
 */
export function getCurrentProject(): ProjectConfig {
  const params = new URLSearchParams(window.location.search);
  return getProjectConfig(params.get("project"));
}
