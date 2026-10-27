import type { RuleCheck } from "../../../features/job-search/adapterRule";
import {
  INVALID_SITE_URL,
  NAME_NEEDED,
  NO_RULE_FILE,
  PICK_ADAPTER,
  RULE_HAS_ERRORS,
  missingVarsMessage,
  testSiteMissingVarsMessage,
} from "../../../features/job-search/messages";
import type { Site } from "../../../features/job-search/types";
import type { AddSiteInput } from "./AddSiteForm";

function isHttpUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface BlockerArgs {
  replacing: boolean;
  input: AddSiteInput;
  check: RuleCheck | null;
  varNames: string[];
  /** 시험에 보낼 사이트별 값 */
  testVars: Record<string, string>;
  /** 새 버전을 시험할 사이트 (교체 때, 쓰는 사이트가 없으면 null) */
  testSite: Site | null;
}

/** [시험 수집]을 누를 수 없는 이유 하나. 누를 수 있으면 null */
export function blockerOf({ replacing, input, check, varNames, testVars, testSite }: BlockerArgs): string | null {
  if (!replacing && input.name.trim() === "") return NAME_NEEDED;
  if (!replacing && !isHttpUrl(input.url)) return INVALID_SITE_URL;
  if (!check) return input.source === "existing" ? PICK_ADAPTER : NO_RULE_FILE;
  if (!check.ok) return RULE_HAS_ERRORS;
  const missing = varNames.filter((n) => !testVars[n]);
  if (missing.length === 0) return null;
  return testSite ? testSiteMissingVarsMessage(testSite.name, missing) : missingVarsMessage(missing);
}
