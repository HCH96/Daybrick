# 구직 관리 AI 테스트 r2 (수정1: 중복 공고 묶기)

- 날짜: 2026-10-30 · 대상: 커밋 8e43785 (수정1 1–7단계)
- 환경: Windows 11, Node v24.20.0(타입 제거 실행), npm·vite, cargo. deno·Supabase 접속 없음
- 방법: A1은 빌드 명령 실제 실행. A3은 순수 함수 Node 실행. A6·A7은 저장소의 `js-process/dedupe.ts`를 메모리 DB 흉내와 함께 Node로 실제 실행(실제 DB 아님). 나머지는 코드·SQL 읽기로 판정. 임시 스크립트는 저장소 밖 임시 폴더에 두었다

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | tsc·build·cargo check | 통과 | [common.md](common.md) |
| A2 | 서버 구조 0007 | 통과 | [common.md](common.md) |
| A3 | 정리·판정 순수 함수 (25건 실행) | 통과 | [dedupe-collect.md](dedupe-collect.md) |
| A4 | 수집 단계 묶기 | 통과 | [dedupe-collect.md](dedupe-collect.md) |
| A5 | 예약 이어 하기 duplicate 제외 | 통과 | [dedupe-collect.md](dedupe-collect.md) |
| A6 | 처리 단계 중복 확인 (12건 실행) | 통과 | [dedupe-process.md](dedupe-process.md) |
| A7 | 소급 적용 (13건 실행) | 통과 | [dedupe-process.md](dedupe-process.md) |
| A8 | 목록·대기 수·필터 다시 적용 제외 | 통과 | [recommend.md](recommend.md) |
| A9 | js_switch_rep·js_unbundle | 통과 | [recommend.md](recommend.md) |
| A10 | 화면 코드 (출처 줄·팝업) | 통과 | [recommend.md](recommend.md) |
| A11 | 자사 설정·같은 사이트 두 번 추가 | 통과 | [sources.md](sources.md) |

합계: 통과 11 · 실패 0

## 실패 항목
없음

## 참고 사항
- A11 결론: 같은 어댑터·같은 주소로 사이트를 하나 더 추가할 수 있다(DB 고유 제약·앱 검사 없음). 두 사이트의 같은 공고는 수집 때 norm_key가 같아 묶인다(코드 추적). 출처 줄에 같은 이름이 두 번 나온다.
- A9: 지원한 묶음 풀기 막기는 화면에만 있고 SQL `js_unbundle`에는 없다(계획대로). 풀린 묶인 공고는 원문이 없어, 수집된 지 7일이 지났으면 다음 수집 때까지 처리되지 않는다.
- A6: 지원한 새 공고가 대표가 되면 옛 대표의 stage·숨김이 복사된다. 후보 좁히기 `ilike`는 회사 이름 앞 두 글자에 공백·기호가 있으면 놓칠 수 있다.
- A4: 수집 단계에서는 한 묶음에 같은 사이트 공고가 둘 들어갈 수 있다(드문 경우).
- 서버 함수 Deno 타입 검사, 실제 Supabase에서의 SQL·함수 실행은 하지 않았다. 사용자 테스트로 넘긴다.
