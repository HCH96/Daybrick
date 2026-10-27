# r1 프로필 기준·추천 목록 (A25–A29, req-profile·req-recommend)

## A25 채점에는 저장된 프로필만
- 테스트 내용: 초안은 채점에 쓰지 않음
- 근거 요구사항: R20–R22
- 수행 방법: js-process/index.ts `loadContext` 읽기(js_settings.profile_version → js_profiles 그 버전). t2-flow에서 저장 v1·v2와 초안에 서로 다른 표시를 넣고 채점 요청 본문 확인
- 예상 결과: 초안 미사용
- 실제 결과: 채점 입력에 지금 저장 버전(v2) 표시만 있고 초안·옛 버전 표시 없음. 서버 함수에서 `js_profile_drafts`를 읽는 곳은 js-profile(초안 쓰기)뿐
- 판정: 통과

## A26 "이전 프로필 기준"
- 테스트 내용: 프로필이 바뀌면 옛 점수에 표시, "다시 채점"할 때만 다시 채점
- 근거 요구사항: R23
- 수행 방법: PostingGrid.tsx·RecommendTab.tsx·PostingPopup.tsx의 해당 줄 읽기. t2-flow에서 js-process rescore
- 예상 결과: 맞음
- 실제 결과: 카드 `stale = 채점 버전 < 지금 버전`, 목록 위 개수도 같은 조건, 팝업은 `>=`면 "현재 프로필 기준" 아니면 "이전 프로필 기준". queue는 같은 버전 점수만 재사용하므로 자동 재채점은 없음(queue는 scored 공고를 꺼내지 않음). rescore는 버전이 다른 점수(p5)만 opus 1번 부르고 버전을 2로 고침
- 판정: 통과

## A27 D-n·마감 지난 공고·정렬
- 테스트 내용: 상시는 맨 뒤, 오늘은 D-day
- 근거 요구사항: R4, R5
- 수행 방법: t1-pure에서 `daysLeft`·`ddayLabel`·`sortPostings` (오늘 2026-10-28)
- 예상 결과: 맞음
- 실제 결과: 오늘 0 → "D-day"(빨강), 내일 1, 어제 −1, 없음 → "상시". D-5 빨강·D-6 보통. 마감 지난 공고 빠짐. 적합도 순 [상시90, 3일80, 3일70, 오늘50], 마감 임박 순 [오늘50, 3일80, 3일70, 상시90] — 같은 날은 점수 순
- 판정: 통과

## A28 "새" 표시
- 테스트 내용: 저장 시각이 없으면 표시 없음
- 근거 요구사항: R8
- 수행 방법: PostingGrid.tsx, useOpenedAt.ts, localState.ts 읽기 (화면 실행 안 함)
- 예상 결과: 맞음
- 실제 결과: `isNew = since !== null && 수집 시각 > since`. 저장 시각(recommendOpenedAt)이 null이거나 파일이 깨지면 since가 null이라 "새" 없음. 읽은 값이 문자열이 아니면 null로 바꿈
- 판정: 통과

## A29 지원·지원 안 함 공고는 재수집돼도 추천 제외
- 테스트 내용: 다시 모여도 추천 목록에 안 나옴
- 근거 요구사항: R15, R16
- 수행 방법: recommendApi.ts `loadScored` 읽기, t2-flow js-collect run
- 예상 결과: 제외됨
- 실제 결과: 추천 목록은 `stage=scored`·`hidden_at is null`·`applied_at is null`만 읽음. 같은 사이트 재수집은 ext_id로 건너뛰어 기존 행(숨김·지원 표시 유지)이 그대로. 다른 사이트에서 같은 회사·제목으로 다시 모인 공고(숨긴 o2, 지원한 o3)는 새 행을 만들지 않음
- 판정: 통과
