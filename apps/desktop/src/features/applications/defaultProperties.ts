import type { OptionColor, PropertyDef, PropertyRole, PropertyType } from "./types";

interface DefaultPropertySpec {
  id: string; // 기본 속성은 고정 id를 쓴다 (사람이 파일을 열어 봐도 알아보기 쉽게)
  name: string;
  type: PropertyType;
  role: PropertyRole | null;
  options?: [string, OptionColor][];
}

/** 명세서 "기본 속성" 표 그대로. 순서 = 팝업 속성 목록 순서. */
const SPECS: DefaultPropertySpec[] = [
  {
    id: "result",
    name: "결과",
    type: "select",
    role: "result",
    options: [
      ["최종 합격", "green"],
      ["불합격", "red"],
      ["지원 포기", "gray"],
    ],
  },
  { id: "company", name: "회사", type: "select", role: "company" },
  { id: "position", name: "직무", type: "select", role: null },
  { id: "posting-url", name: "공고 링크", type: "url", role: null },
  { id: "deadline", name: "마감일", type: "date", role: "deadline" },
  { id: "applied-date", name: "지원일", type: "date", role: "appliedDate" },
  {
    id: "priority",
    name: "우선순위",
    type: "select",
    role: "priority",
    options: [
      ["높음", "red"],
      ["중간", "amber"],
      ["낮음", "gray"],
    ],
  },
  {
    id: "materials",
    name: "제출 자료",
    type: "multi-select",
    role: null,
    options: [
      ["이력서", "gray"],
      ["자기소개서", "gray"],
      ["포트폴리오 PDF", "blue"],
      ["포트폴리오 Notion", "violet"],
      ["기술 소개서", "teal"],
      ["GitHub", "green"],
      ["과제 결과물", "amber"],
    ],
  },
  {
    id: "career",
    name: "경력 구분",
    type: "select",
    role: null,
    options: [
      ["신입", "blue"],
      ["경력", "violet"],
      ["무관", "gray"],
    ],
  },
  {
    id: "employment",
    name: "고용 형태",
    type: "select",
    role: null,
    options: [
      ["정규직", "amber"],
      ["계약직", "gray"],
      ["인턴", "teal"],
      ["전환형 인턴", "pink"],
    ],
  },
];

/** 처음 실행할 때 쓰는 기본 속성 목록을 새로 만든다. */
export function createDefaultProperties(): PropertyDef[] {
  return SPECS.map((spec) => ({
    id: spec.id,
    name: spec.name,
    type: spec.type,
    role: spec.role,
    builtin: true,
    // 우선순위 막대가 기본 항목을 알아볼 수 있도록 항목 id도 고정한다 (예: "priority-0" = 높음)
    options: (spec.options ?? []).map(([name, color], i) => ({ id: `${spec.id}-${i}`, name, color })),
  }));
}
