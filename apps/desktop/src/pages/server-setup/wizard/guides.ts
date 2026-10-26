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

/** 단계별 가이드 (R7). ✓ 자동 체크는 하지 않고 번호 목록만 보여준다. 나머지 단계는 4·6단계에서 채운다. */
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
  keys: {
    stepName: "② 주소·키",
    items: [
      {
        title: "Supabase 대시보드 열기",
        link: { label: "supabase.com/dashboard 열기", url: "https://supabase.com/dashboard" },
      },
      { title: "방금 만든 프로젝트 선택", desc: '프로젝트가 "Healthy"가 될 때까지 1~2분 기다리기' },
      { title: "Project Settings → Data API", desc: "Project URL을 복사해 첫 칸에 붙여넣기" },
      { title: "Project Settings → API Keys", desc: "Publishable key(또는 예전 anon key)를 복사해 둘째 칸에" },
      { title: "[확인] 누르기", desc: "서버에 접속해 상태를 확인합니다" },
    ],
    tip: {
      title: "Secret 키는 넣지 마세요",
      paragraphs: ["secret / service_role 키는 서버의 모든 데이터를 열 수 있는 키라 앱에 넣지 않습니다."],
    },
  },
};

/** 입력칸 아래 "어디서 찾나요?" 도움말 (R8): 메뉴 경로 칩과 그 화면을 흉내 낸 작은 그림 */
export interface FieldHelp {
  title: string;
  link?: { label: string; url: string };
  /** 메뉴 경로 (칩으로 그림) */
  path: string[];
  /** 작은 그림의 줄: 왼쪽 이름, 오른쪽 값. highlight면 복사할 값으로 강조 */
  shot: { name: string; value: string; highlight?: boolean }[];
}

const DASHBOARD_LINK = { label: "대시보드 열기", url: "https://supabase.com/dashboard" };

export const FIELD_HELPS = {
  supabaseUrl: {
    title: "Supabase 대시보드에서 찾기",
    link: DASHBOARD_LINK,
    path: ["내 프로젝트", "Project Settings", "Data API"],
    shot: [{ name: "Project URL", value: "https://xxxx.supabase.co", highlight: true }],
  },
  supabaseKey: {
    title: "Supabase 대시보드에서 찾기",
    link: DASHBOARD_LINK,
    path: ["내 프로젝트", "Project Settings", "API Keys"],
    shot: [
      { name: "Publishable key", value: "sb_publishable_…", highlight: true },
      { name: "Secret key", value: "사용하지 마세요" },
      { name: "Legacy API Keys 탭의 anon", value: "eyJ… (이것도 됩니다)" },
    ],
  },
} satisfies Record<string, FieldHelp>;
