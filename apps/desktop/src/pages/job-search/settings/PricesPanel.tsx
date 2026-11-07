import { useState } from "react";
import { savePrices } from "../../../features/job-search/api";
import { INVALID_PRICE, SAVED_MESSAGE, saveErrorMessage } from "../../../features/job-search/messages";
import type { ModelPrice } from "../../../features/job-search/types";
import { useJobSearch, type JobSearchData } from "../../../features/job-search/useJobSearch";
import { ListIcon } from "./SettingsIcons";
import SaveResult, { type SaveState } from "./SaveResult";

/** 표에 보여 줄 모델과 쓰는 곳 (계획 index.md 작은 규칙의 모델 id) */
const MODELS: readonly { id: string; label: string; uses: string }[] = [
  { id: "claude-opus-5-5", label: "Opus 5.5", uses: "적합도 채점, 프로필 생성" },
  { id: "claude-haiku-5-5", label: "Haiku 5.5", uses: "항목 추출, 인젝션 검사, 메일 분류" },
];

const COLUMNS: readonly { key: keyof ModelPrice; label: string }[] = [
  { key: "input", label: "입력" },
  { key: "output", label: "출력" },
  { key: "cacheRead", label: "캐시 읽기" },
  { key: "cacheWrite", label: "캐시 쓰기" },
];

type PriceDraft = Record<string, Record<keyof ModelPrice, string>>;

function toDraft(prices: Record<string, ModelPrice>): PriceDraft {
  const draft: PriceDraft = {};
  for (const { id } of MODELS) {
    const p = prices[id] ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    draft[id] = {
      input: String(p.input),
      output: String(p.output),
      cacheRead: String(p.cacheRead),
      cacheWrite: String(p.cacheWrite),
    };
  }
  return draft;
}

/** 칸 글자를 숫자로. 하나라도 맞지 않으면 null */
function parseDraft(draft: PriceDraft, base: Record<string, ModelPrice>): Record<string, ModelPrice> | null {
  // 표에 없는 모델의 단가는 그대로 둔다
  const prices: Record<string, ModelPrice> = { ...base };
  for (const { id } of MODELS) {
    const row = draft[id];
    const values = COLUMNS.map(({ key }) => (row[key].trim() === "" ? NaN : Number(row[key])));
    if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;
    const [input, output, cacheRead, cacheWrite] = values;
    prices[id] = { input, output, cacheRead, cacheWrite };
  }
  return prices;
}

/** 설정 탭 모델 단가 판 (R71, R79): 모델별 입력·출력·캐시 읽기·캐시 쓰기, 100만 토큰당 USD */
function PricesPanel({ data }: { data: JobSearchData }) {
  const { session, refresh } = useJobSearch();
  const [draft, setDraft] = useState<PriceDraft>(() => toDraft(data.settings.prices));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveState>(null);

  function change(model: string, key: keyof ModelPrice, value: string) {
    setDraft((prev) => ({ ...prev, [model]: { ...prev[model], [key]: value } }));
  }

  async function save() {
    const prices = parseDraft(draft, data.settings.prices);
    if (!prices) return setResult({ ok: false, text: INVALID_PRICE });
    setSaving(true);
    const saved = await savePrices(session, prices);
    setSaving(false);
    setResult(saved.ok ? { ok: true, text: SAVED_MESSAGE } : { ok: false, text: saveErrorMessage(saved.error) });
    if (saved.ok) await refresh();
  }

  return (
    <section className="js-settings__panel">
      <h3 className="js-settings__title">
        <ListIcon />
        모델 단가 <span className="js-settings__sub">100만 토큰당 USD · 서버 설정</span>
      </h3>
      <table className="js-settings__tbl">
        <thead>
          <tr>
            <th>모델</th>
            <th>쓰는 곳</th>
            {COLUMNS.map(({ key, label }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODELS.map(({ id, label, uses }) => (
            <tr key={id}>
              <td>
                <b>{label}</b>
              </td>
              <td className="js-settings__sub">{uses}</td>
              {COLUMNS.map(({ key, label: column }) => (
                <td key={key}>
                  <span className="js-settings__input js-settings__input--price">
                    <input
                      inputMode="decimal"
                      aria-label={`${label} ${column}`}
                      value={draft[id][key]}
                      onChange={(e) => change(id, key, e.target.value)}
                    />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="js-settings__foot-note">단가를 바꾸면 그 뒤 호출부터 새 단가로 계산해요</div>
      <div className="js-settings__actions">
        <button type="button" className="setup-btn" disabled={saving} onClick={() => void save()}>
          단가 저장
        </button>
        <SaveResult state={result} />
      </div>
    </section>
  );
}

export default PricesPanel;
