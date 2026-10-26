import type { WizardStepId } from "./useWizard";

/** 가이드 한 줄: 굵은 제목 + 설명 또는 외부 링크 */
export interface GuideItem {
  title: string;
  desc?: string;
  /** 기본 브라우저로 여는 외부 링크 (R9) */
  link?: { label: string; url: string };
}

export interface StepGuide {
  /** 머리 줄 "가이드 · ① 준비"의 단계 이름 */
  stepName: string;
  items: GuideItem[];
  /** 가이드 맨 아래 주의 상자 */
  tip?: { title: string; paragraphs: string[] };
}

/** 단계별 가이드 (R7). ✓ 자동 체크는 하지 않고 번호 목록만 보여준다. 나머지 단계는 3·4·6단계에서 채운다. */
export const GUIDES: Partial<Record<WizardStepId, StepGuide>> = {
  prepare: {
    stepName: "① 준비",
    items: [
      { title: "Supabase 가입", link: { label: "supabase.com 열기", url: "https://supabase.com" } },
      { title: "새 프로젝트 만들기", desc: "지역은 Northeast Asia (Seoul), DB 비밀번호는 따로 적어 두기" },
      {
        title: "Anthropic 콘솔 가입·결제 수단 등록",
        link: { label: "console.anthropic.com 열기", url: "https://console.anthropic.com" },
      },
      { title: "API 키 발급", desc: "Settings → API Keys → Create Key. 키는 한 번만 보이니 복사해 두기" },
      {
        title: "Google Cloud 프로젝트 만들기",
        link: { label: "console.cloud.google.com 열기", url: "https://console.cloud.google.com" },
      },
    ],
    tip: {
      title: "무료 플랜·비용 주의",
      paragraphs: [
        "Supabase 무료 플랜은 7일 동안 쓰지 않으면 서버가 일시정지됩니다. 대시보드에서 [Restore]를 누르거나 앱에서 PAT로 다시 켤 수 있습니다.",
        "Anthropic API는 쓴 만큼 요금이 나갑니다. 콘솔에서 월 사용 한도를 정해 두세요.",
      ],
    },
  },
};
