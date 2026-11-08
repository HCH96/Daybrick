import { useState } from "react";
import { PlusIcon, SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { RefreshIcon } from "../../../components/icons/ServerIcons";
import { checkRule, ruleName, type RuleCheck } from "../../../features/job-search/adapterRule";
import { addSite, replaceAdapterRule, testCollect } from "../../../features/job-search/api";
import {
  ADD_SITE_NOTE,
  TEST_NEEDED,
  adapterReplaceErrorMessage,
  adapterReplacedMessage,
  replaceNote,
  siteAddErrorMessage,
  siteAddedMessage,
  testCallErrorMessage,
} from "../../../features/job-search/messages";
import type { Adapter, Site } from "../../../features/job-search/types";
import { useJobSearch } from "../../../features/job-search/useJobSearch";
import "../../server-setup/wizard/WizardFields.css";
import "./AddSiteDialog.css";
import AddSiteForm, { type AddSiteInput } from "./AddSiteForm";
import type { RuleFile } from "./RuleFilePicker";
import SourcesDialog from "./SourcesDialog";
import { PlayIcon, UploadIcon } from "./SourcesIcons";
import TestResult, { type TestState } from "./TestResult";
import { blockerOf, clearsTest } from "./addSiteRules";

/** 사이트 추가, 또는 어댑터 하나의 새 버전 올리기 (같은 창, R32) */
export type AddSiteMode = { kind: "add" } | { kind: "replace"; adapter: Adapter };

interface AddSiteDialogProps {
  mode: AddSiteMode;
  adapters: Adapter[];
  sites: Site[];
  onClose: () => void;
  /** 저장했다: 탭이 표를 다시 읽고 결과 줄에 문구를 띄운다 */
  onSaved: (message: string) => void;
}

const STEP_NAMES = ["입력", "시험 수집", "저장"];

function Steps({ step }: { step: number }) {
  return (
    <div className="js-add__steps" aria-label={`${step}단계: ${STEP_NAMES[step - 1]}`}>
      {STEP_NAMES.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "on" : "todo";
        return (
          <span key={label} className="js-add__steps-item">
            {i > 0 && <span className="js-add__steps-line">—</span>}
            <span className={`js-add__step js-add__step--${state}`}>
              <i>{state === "done" ? <SmallCheckIcon size={12} /> : n}</i>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * 사이트 추가 창 (R28, R29, R32): 왼쪽 입력 → [시험 수집] → 오른쪽 결과 → 성공하면 [저장].
 * 입력을 바꾸면 시험 결과를 지워 [저장]을 다시 끈다 (자사 체크는 예외).
 */
function AddSiteDialog({ mode, adapters, sites, onClose, onSaved }: AddSiteDialogProps) {
  const { session } = useJobSearch();
  const replacing = mode.kind === "replace" ? mode.adapter : null;
  const usingSites = replacing ? sites.filter((s) => s.adapterId === replacing.id) : [];
  const [input, setInput] = useState<AddSiteInput>({
    name: "",
    url: "",
    source: replacing ? "file" : "existing",
    adapterId: adapters[0]?.id ?? "",
    vars: {},
    testSiteId: usingSites[0]?.id ?? "",
    ownSite: false,
  });
  const [ruleFile, setRuleFile] = useState<RuleFile | null>(null);
  const [test, setTest] = useState<TestState>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selected = adapters.find((a) => a.id === input.adapterId) ?? null;
  const check: RuleCheck | null =
    input.source === "existing" ? (selected ? checkRule(selected.rule) : null) : (ruleFile?.check ?? null);
  const varNames = check?.ok ? check.vars : [];
  const testSite = usingSites.find((s) => s.id === input.testSiteId) ?? null;
  const testVars: Record<string, string> = testSite
    ? testSite.vars
    : Object.fromEntries(varNames.map((n) => [n, (input.vars[n] ?? "").trim()]));
  const blocker = blockerOf({ replacing: replacing !== null, input, check, varNames, testVars, testSite });

  const busy = test.kind === "running" || saving;
  const passed = test.kind === "done" && test.result.ok && test.result.passed;
  const step = passed ? 3 : test.kind === "idle" ? 1 : 2;

  function edit(next: Partial<AddSiteInput>) {
    setInput((prev) => ({ ...prev, ...next }));
    setSaveError(null);
    if (clearsTest(next)) setTest({ kind: "idle" });
  }

  function pickFile(file: RuleFile) {
    setRuleFile(file);
    edit({ source: "file" });
  }

  async function runTest() {
    if (!check?.ok || blocker) return;
    setTest({ kind: "running" });
    setSaveError(null);
    const result = await testCollect(session, check.rule, testVars);
    setTest(result.ok ? { kind: "done", result: result.value } : { kind: "error", text: testCallErrorMessage(result.error) });
  }

  async function save() {
    if (!passed || !check?.ok) return;
    setSaving(true);
    setSaveError(null);
    const result = replacing
      ? await replaceAdapterRule(session, replacing, check.rule)
      : await addSite(
          session,
          { name: input.name.trim(), url: input.url.trim(), vars: testVars, ownSite: input.ownSite },
          input.source === "existing"
            ? { kind: "existing", adapterId: input.adapterId }
            : { kind: "rule", name: ruleName(check.rule), rule: check.rule },
        );
    setSaving(false);
    if (!result.ok) {
      setSaveError(replacing ? adapterReplaceErrorMessage(result.error) : siteAddErrorMessage(result.error));
      return;
    }
    onSaved(
      replacing ? adapterReplacedMessage(replacing.name, replacing.version + 1) : siteAddedMessage(input.name.trim()),
    );
  }

  const footer = (
    <>
      <span className="js-dlg__note">
        {saveError ? (
          <span className="js-add__bad" role="alert">
            {saveError}
          </span>
        ) : replacing ? (
          replaceNote(replacing.version + 1)
        ) : (
          ADD_SITE_NOTE
        )}
      </span>
      <button type="button" className="setup-btn setup-btn--ghost" disabled={busy} onClick={onClose}>
        취소
      </button>
      {test.kind !== "idle" && (
        <button type="button" className="setup-btn" disabled={busy || blocker !== null} onClick={() => void runTest()}>
          <RefreshIcon size={16} />
          다시 시험
        </button>
      )}
      <button
        type="button"
        className="setup-btn setup-btn--primary"
        disabled={!passed || busy}
        title={passed ? undefined : TEST_NEEDED}
        aria-busy={saving}
        onClick={() => void save()}
      >
        <SmallCheckIcon size={16} />
        {saving ? "저장 중…" : "저장"}
      </button>
    </>
  );

  return (
    <SourcesDialog
      title={replacing ? `${replacing.name} 새 버전 올리기` : "사이트 추가"}
      icon={replacing ? <UploadIcon /> : <PlusIcon size={16} />}
      onClose={busy ? null : onClose}
      headExtra={<Steps step={step} />}
      footer={footer}
    >
      <div className="js-add">
        <fieldset className="js-add__form" disabled={busy}>
          <AddSiteForm
            replacing={replacing}
            adapters={adapters}
            usingSites={usingSites}
            input={input}
            ruleFile={ruleFile}
            varNames={testSite ? [] : varNames}
            onEdit={edit}
            onPickFile={pickFile}
          />
          <div className="js-add__test-row">
            <button type="button" className="setup-btn" disabled={blocker !== null} onClick={() => void runTest()}>
              <PlayIcon />
              시험 수집
            </button>
            {blocker && <span className="js-add__hint">{blocker}</span>}
          </div>
        </fieldset>
        <div className="js-add__result">
          <TestResult state={test} />
        </div>
      </div>
    </SourcesDialog>
  );
}

export default AddSiteDialog;
