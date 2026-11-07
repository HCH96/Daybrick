import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { SettingsIcon } from "../../../components/icons/NavIcons";
import { KeyIcon, PauseIcon } from "../../../components/icons/ServerIcons";
import type { DoneSummary } from "./useWizard";
import "./CenterCard.css";

function hostOf(url: string): string {
  return url.replace(/^https:\/\//, "");
}

/** "등록됨 · 2026-10-26" (기록이 없거나 읽지 못하면 그렇게 적는다) */
function keyLine(at: string | null): string {
  if (!at) return "등록일 확인 못 함";
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return "등록됨";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `등록됨 · ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * ④ 완료: 요약(서버 주소, 로그인 계정, 서버 구조 번호, Anthropic 키 등록일)과 다음에 할 일 (R19).
 * PAT 지우기 안내는 자동 세팅으로 끝났을 때만 보여준다.
 */
function DoneStep({ summary }: { summary: DoneSummary }) {
  return (
    <div className="wiz-center">
      <div className="wiz-big-mark wiz-big-mark--ok">
        <SmallCheckIcon size={32} />
      </div>
      <h2>서버 연결을 마쳤습니다</h2>
      <p>이제 이 서버가 Daybrick의 데이터를 보관합니다</p>

      <div className="wiz-summary">
        <div>
          <span>서버</span>
          <b className="wiz-summary__mono">{hostOf(summary.url)}</b>
        </div>
        <div>
          <span>로그인 계정</span>
          <b>{summary.email ?? "확인 못 함"}</b>
        </div>
        <div>
          <span>서버 구조</span>
          <b>
            {summary.schema ?? "?"} (앱 {summary.appSchema})
          </b>
        </div>
        <div>
          <span>Anthropic 키</span>
          <b>{keyLine(summary.keyRegisteredAt)}</b>
        </div>
      </div>

      <div className="wiz-next-list">
        <div>
          <SettingsIcon />
          <p>
            연결 정보는 <b>Settings → 서버 연결</b>에서 볼 수 있습니다
            <span>로그아웃, 키 교체, 연결 해제도 여기서 합니다</span>
          </p>
        </div>
        <div>
          <PauseIcon />
          <p>
            7일 동안 앱을 안 켜면 서버가 멈출 수 있습니다
            <span>앱 위쪽에 안내 띠가 뜨면 눌러서 다시 켜세요</span>
          </p>
        </div>
        {summary.viaSetup && (
          <div>
            <KeyIcon />
            <p>
              세팅에 쓴 PAT는 이제 지워도 됩니다
              <span>Supabase 계정 설정 → Access Tokens</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoneStep;
