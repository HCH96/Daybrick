# r2 · 속성·저장 데이터 옮기기 (A3, A4, A5, A16)

공통 수행 방법: `features/applications/`의 순수 함수를 임시 폴더의 시험 파일(entry.ts)에서 불러 `npx rolldown`으로 묶은 뒤 `node out.mjs`로 실행했다. 새 일정 id는 `new-1, new-2 …`로 고정해 넣었다. v1 속성 목록은 첫 커밋(83c5b9f)의 기본 속성(공고 링크 뒤에 마감일 `deadline`·지원일 `applied-date`)을 그대로 재현했다.

## A3 옮기기 함수 — step-01 예시
- 테스트 내용: plan/step-01.md "확인할 결과"의 v1 예시를 `migrateV1ToV2`에 넣고 v2 예시와 비교
- 근거 요구사항: R40, R21
- 수행 방법: `migrate.ts`의 `migrateV1ToV2` 실행. 입력 카드: 지원 준비, values `{deadline:"2026-10-28","applied-date":"2026-10-20"}`, 일정 `applied 10-20`, `interview 11-02`
- 예상 결과: `version:2`, 속성에 마감일·지원일 없음, values `{}`, 일정 `[interview 11-02, application-due 10-28]`
- 실제 결과: `version:2`, 속성 id `result, company, position, posting-url, priority, materials, career, employment`(역할은 result·company·priority만 남음), values `{}`, 일정 `[{e2 interview 2026-11-02}, {new-1 application-due 2026-10-28, time null, memo ""}]`. 예시와 순서까지 같다.
- 판정: **통과**

## A4 옮기기 경계
- 테스트 내용: (1) 마감일 속성을 지운 v1 (2) 종료 카드의 마감일 (3) 마감일 값 없음 (4) 이미 v2인 파일
- 근거 요구사항: R40
- 수행 방법: `migrateV1ToV2`, `isV1Data` 실행. (4)는 `storage.ts`의 `loadApplicationsData` 분기도 읽음
- 예상 결과: 지운 속성은 건너뜀 / 종료 카드도 지원 마감 일정 생김 / 값 없으면 일정 안 만듦 / v2는 그대로
- 실제 결과:
  - (1) `deadline` 속성이 없고 값이 `null`이거나 키가 없는 카드 2장 → 일정 0개, values `{}`, 오류 없음
  - (2) 종료 카드 마감일 `2026-09-30` → 기존 코딩테스트 일정 뒤에 `application-due 2026-09-30`이 붙음
  - (3) 값 `null`, `""`, 키 없음 → 세 카드 모두 일정 0개 (`isDateKey`가 YYYY-MM-DD만 통과)
  - (4) `isV1Data({version:2,…})` = false, `{version:1}` = true. `loadApplicationsData`는 v1일 때만 옮기고 저장하며, v2는 받은 객체를 그대로 돌려준다
- 판정: **통과**

## A5 기본 속성 목록과 삭제 가능 여부
- 테스트 내용: 기본 속성에 마감일·지원일이 없고, 제목·상태만 삭제할 수 없는지
- 근거 요구사항: R33, R40, R28
- 수행 방법: `createDefaultProperties` 실행, `propertyTypes.ts`의 `canChangeType`, `PropertyMenu.tsx`(삭제 버튼·확인 문구), `propertyReducer.ts`의 `delete-property`, `ApplicationDetailModal.tsx`·`StatusRow.tsx` 확인
- 예상 결과: 마감일·지원일 없음, 제목·상태만 삭제 불가
- 실제 결과: 속성 8개 `결과, 회사, 직무, 공고 링크, 우선순위, 제출 자료, 경력 구분, 고용 형태`, 날짜 종류 속성 0개. 속성 메뉴의 "속성 삭제"는 조건 없이 모든 속성에 나오고 `delete-property`도 막는 조건이 없다. 제목·상태는 속성 목록이 아니라 카드 칸(`title`, `status`)이고 `StatusRow`에는 삭제 동작이 없다. 종류 바꾸기만 역할 속성(result·company·priority)에서 막힌다. 삭제 확인 문구에 마감일·지원일 안내가 없다(`ROLE_DELETE_NOTE`는 priority·result·company만).
- 판정: **통과**

## A16 사용자 테스트용 v1 예시 파일
- 테스트 내용: 앱이 읽을 수 있는 v1 파일을 만들고, 같은 파일을 `migrateV1ToV2`로 옮긴 결과 기록
- 근거 요구사항: R40
- 수행 방법: 시험 파일에서 v1 데이터를 만들어 `docs/desktop/features/applications/human/tests/r2-data/applications.json`에 저장. 다시 읽어 `version 1`, 속성 10개(마감일·지원일 포함), 카드 3장 확인. `storage.ts`의 `hasDataShape`(properties·applications 배열)와 `isV1Data`(version 1)를 통과하는 모양
- 파일 내용(날짜 고정, 오늘 기준 아님):
  - 카드1 "V1 지원준비": 지원 준비, `deadline 2026-11-05`, `applied-date null`, 일정 없음
  - 카드2 "V1 지원완료": 지원 완료, `deadline 2026-10-20`, `applied-date 2026-10-18`, 일정 `applied 2026-10-18`, `interview 2026-11-10`
  - 카드3 "V1 종료": 종료, `deadline 2026-10-01`, 일정 `coding-test 2026-10-08`
- 옮긴 결과(`version:2`, 속성 8개, 모든 카드 values `{}`; 표시는 오늘 2026-10-23 기준):
  - 카드1: 일정 `application-due 2026-11-05` 1개 → 카드·📅 옆 "D-13 지원 마감"(회색), 달력 11/5에 흐린 "V1 지원준비 · 지원 마감"
  - 카드2: `applied` 일정 사라짐, 일정 `interview 2026-11-10`, `application-due 2026-10-20` → 카드 "D-18 면접", 지원 마감은 지원 완료 카드라 카드·달력에 안 보이고 📅 창 목록에만 있음
  - 카드3: 일정 `coding-test 2026-10-08`, `application-due 2026-10-01` → 아래쪽 줄 "마지막 일정 10/8 코딩테스트"(지원 마감 제외), 달력엔 코딩테스트만
- 판정: **통과**
