import { GAMEJOB_EXAMPLE, NEXON_EXAMPLE } from "./guideExamples";
import { GUIDE_KEYS, type GuideKeyRow } from "./guideKeys";

/** 어댑터 작성 가이드 본문 (R30). 형식 설명은 규칙 형식 v1(D16, D30)과 `adapterRule.ts` 검사를 따른다 */

export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "code"; code: string; label: string }
  | { kind: "keys"; rows: GuideKeyRow[] }
  | { kind: "list"; items: string[] };

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

const SKELETON = `{
  "format": 1,
  "name": "my-site",
  "vars": ["companyCode"],
  "delayMs": 1500,
  "list": {
    "url": "https://www.example.com/jobs?company={companyCode}&page={page}",
    "pages": 3,
    "type": "html",
    "item": "ul.job-list li",
    "fields": {
      "id": { "sel": "a", "attr": "href", "regex": "/jobs/(\\\\d+)" },
      "title": { "sel": ".title" },
      "company": { "sel": ".company", "optional": true },
      "link": { "sel": "a", "attr": "href", "base": "https://www.example.com" }
    }
  },
  "detail": { "url": "{link}", "type": "html", "body": "article", "images": "article img" }
}`;

const PROMPT = `아래 채용 사이트의 공고 목록을 읽는 Daybrick 어댑터 규칙 파일(JSON)을 만들어 줘.

[규칙 형식 v1]
- 필수: format(1), name, list.url, list.type(html|json), list.item, list.fields.title, list.fields.link
- 선택: vars(사이트별 값 이름), delayMs, list.method(GET|POST)·headers·body, list.pages(최대 10),
  list.session, list.fields.id·company·duty·body와 보조 칸, detail(url·type·body·images·frame)
- 상세 본문이 iframe 안에 있으면 detail.frame에 그 iframe 선택자를 쓴다. body·images는 iframe 안 화면 기준이다.
- 상세 본문이 여러 칸에 나뉘어 있으면 detail.body를 경로(또는 선택자) 배열로 쓴다. 차례로 이어 붙인다.
- 목록 API가 세션 쿠키·CSRF 토큰을 요구하면 list.session { "url": 목록 화면 주소, "token": { "regex": 토큰을 첫 괄호로 뽑는 정규식, "header": 헤더 이름 } }을 쓴다.
- {이름}은 vars 값, {page}는 쪽 번호, 상세 주소에서는 {id}·{link}로 바뀐다.
- HTML은 CSS 선택자, JSON은 $.a.b[*] 같은 점 경로로 읽는다.
- 칸은 { "sel": 선택자, "attr": 속성, "regex": 첫 괄호를 뽑는 정규식, "base": 앞에 붙일 주소, "optional": true }
- 또는 칸 틀 { "template": "https://…/view?seq={id}" }: {이름}에 같은 공고의 다른 칸·vars 값이 들어간다. {}가 없으면 고정 글자다(회사명 등). sel·attr·regex·base와 함께 쓰지 않는다.
- 틀에만 쓸 값은 다른 이름의 보조 칸(예: "regOpId")으로 읽는다. 저장하지 않는다.

[예시: 게임잡]
${GAMEJOB_EXAMPLE}

[사이트]
- 목록 주소: (여기에 공고 목록 주소)
- 목록 HTML 또는 API 응답 일부: (여기에 붙여 넣기)
- 공고 상세 HTML 일부: (여기에 붙여 넣기)

설명 없이 JSON만 답해 줘.`;

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "format",
    title: "규칙 파일 형식",
    blocks: [
      {
        kind: "p",
        text: "어댑터는 JSON 파일 하나예요. 서버의 공용 수집 함수가 이 규칙대로 목록을 읽고 공고 상세를 가져와요. {companyCode}처럼 중괄호로 쓴 값은 사이트별 값으로 채워져요.",
      },
      { kind: "code", code: SKELETON, label: "규칙 파일 뼈대" },
      { kind: "keys", rows: GUIDE_KEYS },
    ],
  },
  {
    id: "gamejob",
    title: "예시: 게임잡",
    blocks: [
      {
        kind: "p",
        text: "HTML 목록을 POST 폼으로 읽는 예시예요. 직무 코드(dutyCode)를 사이트별 값으로 받아, 같은 어댑터로 직무만 바꾼 사이트를 여러 개 둘 수 있어요.",
      },
      { kind: "code", code: GAMEJOB_EXAMPLE, label: "게임잡 규칙" },
    ],
  },
  {
    id: "nexon",
    title: "예시: 넥슨",
    blocks: [
      {
        kind: "p",
        text: "JSON API를 읽는 예시예요. 목록이 본문(contents)까지 주므로 fields.body로 받아 상세 요청을 건너뛰어요.",
      },
      { kind: "code", code: NEXON_EXAMPLE, label: "넥슨 규칙" },
    ],
  },
  {
    id: "prompt",
    title: "AI에게 맡기기 (프롬프트 틀)",
    blocks: [
      {
        kind: "p",
        text: "아래 글을 복사해 괄호 자리에 사이트 주소와 HTML(또는 API 응답) 일부를 붙이고 AI에게 보내세요. 받은 JSON을 파일로 저장해 [사이트 추가]에서 올리면 돼요.",
      },
      { kind: "code", code: PROMPT, label: "프롬프트 틀" },
    ],
  },
  {
    id: "errors",
    title: "시험 수집과 자주 나는 오류",
    blocks: [
      {
        kind: "p",
        text: "규칙 파일을 올리면 형식부터 검사하고, [시험 수집]으로 목록을 실제로 읽어 봐요. 아무것도 저장하지 않고, 성공해야 저장할 수 있어요.",
      },
      {
        kind: "list",
        items: [
          "\"list.item이 없어요\" 같은 글: 필수 칸이 빠졌어요. 키 이름 그대로 채워 주세요.",
          "읽은 공고 0개: list.item 선택자가 맞지 않거나, 목록이 브라우저에서 스크립트로 그려지는 사이트예요. 개발자 도구의 네트워크 탭에서 목록 API를 찾아 type을 json으로 써 보세요.",
          "제목·링크가 빠진 공고가 절반을 넘음: fields.title·link의 sel이 항목 안에서 맞는지 보세요.",
          "HTTP 403·404: 주소가 틀렸거나 사이트가 막았어요. method·headers·body를 브라우저 요청과 같게 맞춰 보세요. 브라우저에서는 되는데 403이면 세션 쿠키·CSRF 토큰이 필요한 사이트일 수 있어요. list.session을 써 보세요.",
          "세션 준비 실패·세션 토큰을 찾지 못함: list.session.url 화면이 열리는지, token.regex가 그 화면 HTML의 토큰(예: <meta name=\"_csrf\" content=\"…\">)과 맞는지 보세요. 등호 주변 공백도 정규식에 맞아야 해요.",
          "링크가 API 주소로 저장됨: link에 template을 써서 사람이 보는 화면 주소로 만드세요. 예: { \"template\": \"https://…/view?seq={id}\" }",
          "본문이 비어 있음: detail.body 선택자를 확인하세요. 본문이 여러 칸에 나뉘어 있으면 배열로 쓰세요. 상세 페이지가 공고를 iframe으로 끼워 보여 주면 detail.frame에 그 선택자를 쓰세요. 이미지로 된 공고는 글이 짧으면 이미지를 따로 저장해요.",
        ],
      },
    ],
  },
];
