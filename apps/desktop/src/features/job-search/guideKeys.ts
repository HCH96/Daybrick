/** 어댑터 작성 가이드의 키 표 (R30). 규칙 형식 v1(D16, D30, D48–D51)과 `adapterRule.ts` 검사를 따른다 */

export interface GuideKeyRow {
  key: string;
  desc: string;
  required: boolean;
}

export const GUIDE_KEYS: GuideKeyRow[] = [
  { key: "format", desc: "형식 번호. 지금은 1", required: true },
  { key: "name", desc: "어댑터 이름 (영문 추천)", required: true },
  { key: "vars", desc: "사이트마다 다른 값의 이름 목록. 주소·본문에 {이름}으로 쓰면 사이트별 값으로 바뀜", required: false },
  { key: "delayMs", desc: "같은 사이트 요청 사이 간격(ms). 기본 1500", required: false },
  { key: "list.url", desc: "공고 목록 주소. {page}가 있으면 쪽을 넘기며 읽음", required: true },
  { key: "list.type", desc: "목록 응답 종류: html 또는 json", required: true },
  { key: "list.method · headers · body", desc: "POST로 읽을 때. body가 글자면 폼 본문, 객체면 JSON 본문", required: false },
  { key: "list.pages", desc: "읽을 쪽 수. 기본 1, 최대 10. 빈 쪽이 나오면 멈춤", required: false },
  {
    key: "list.session",
    desc: "목록 API가 세션 쿠키·CSRF 토큰을 요구할 때. { url, token: { regex, header } }: 목록 전에 url 화면을 한 번 받아 쿠키와, regex 첫 괄호로 뽑은 토큰(header 이름)을 목록 요청에 붙임",
    required: false,
  },
  { key: "list.item", desc: "공고 하나를 가리키는 CSS 선택자, JSON이면 $.list[*] 같은 경로", required: true },
  { key: "list.fields.title", desc: "공고 제목", required: true },
  { key: "list.fields.link", desc: "공고 주소 (상대 주소면 base로 완성, base에는 {이름}을 쓰지 않음)", required: true },
  { key: "list.fields.id · company · duty", desc: "공고 번호·회사·직무. id가 없으면 주소로 같은 공고를 판단", required: false },
  { key: "list.fields.body", desc: "목록이 본문까지 주면 그 위치 (상세 요청을 건너뜀)", required: false },
  { key: "list.fields.(다른 이름)", desc: "보조 칸. 저장하지 않고 다른 칸의 template 안에서만 씀 (예: regOpId)", required: false },
  { key: "칸의 sel · attr · regex · base", desc: "선택자(JSON은 점 경로) · 읽을 속성 · 첫 괄호를 뽑을 정규식 · 앞에 붙일 주소", required: false },
  {
    key: "칸의 template",
    desc: "칸 틀. {이름}에 같은 공고의 다른 칸 값이나 사이트 값이 들어감 (예: \"https://…/view?seq={id}\"). 값이 비면 칸도 빔. {}가 없으면 고정 글자 (예: 회사명). sel·attr·regex·base와 함께 쓰지 않음",
    required: false,
  },
  { key: "detail.url · type", desc: "상세 주소와 응답 종류. {id}·{link}를 쓸 수 있음. detail이 있으면 필수", required: false },
  {
    key: "detail.body · images",
    desc: "본문 위치(기본 body) · 이미지 선택자(기본 img). body를 배열로 쓰면 여러 칸을 차례로 이어 붙임. JSON 값이 &lt;p&gt;처럼 이스케이프돼 있으면 풀어서 읽음. 글이 짧으면 이미지를 저장",
    required: false,
  },
  { key: "detail.frame", desc: "본문이 끼워 넣은 화면(iframe) 안에 있을 때 그 선택자. 화면 주소를 한 번 더 받아 거기서 body·images를 읽음 (html만)", required: false },
];
