import { useEffect, useState } from "react";
import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { CopyIcon } from "../../../components/icons/ServerIcons";

/** Google OAuth 클라이언트에 넣을 Supabase 로그인 콜백 주소 (R54) */
function googleRedirectUrl(ref: string): string {
  return `https://${ref}.supabase.co/auth/v1/callback`;
}

/** [복사] 뒤 "복사됨"으로 보이는 시간 */
const COPIED_MS = 2000;

/** 리디렉션 주소 읽기 전용 칸 + [복사] (R54). Google 칸 위에 둔다. */
function RedirectUrlRow({ projectRef }: { projectRef: string }) {
  const url = googleRedirectUrl(projectRef);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // 클립보드를 못 쓰면 칸을 직접 선택해 복사할 수 있다
      setCopied(false);
    }
  }

  return (
    <div className="wiz-field">
      <label className="wiz-field__label" htmlFor="wiz-redirect-url">
        리디렉션 주소
        <span className="wiz-field__note">Google OAuth 클라이언트의 "승인된 리디렉션 URI"에 붙여넣고 저장</span>
      </label>
      <div className="wiz-redirect">
        <div className="wiz-input wiz-input--ro">
          <input
            id="wiz-redirect-url"
            className="wiz-input__field"
            value={url}
            readOnly
            spellCheck={false}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <button type="button" className="setup-btn" onClick={() => void copy()}>
          {copied ? <SmallCheckIcon size={16} /> : <CopyIcon size={16} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
    </div>
  );
}

export default RedirectUrlRow;
