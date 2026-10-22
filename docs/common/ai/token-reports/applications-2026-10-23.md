# 토큰 보고서: applications /implement
세션 0656b3d2-7f94-4fda-82e3-bfc55123d54a · 2026-10-22 · 스크립트 `.claude/scripts/token-report.mjs`로 생성

읽는 법: 컨텍스트 = 호출 한 번에 모델이 읽는 입력 전체. 캐시 읽기는 싸고(약 0.1배), 캐시 쓰기는 비싸다(약 1.25배).
"누적 비용" = 그 항목의 크기 × 그 뒤에 남은 호출 수. 일찍 들어온 큰 항목일수록 이후 호출마다 다시 읽혀 비싸다.

## 총합
- API 호출 112회, 입력 9,988,396 (캐시 읽기 9,716,630 / 캐시 쓰기 271,538 / 새 입력 228), 출력 44,962 (생각 5,955)

## 구간별
| 구간 | 호출 | 시작 ctx | 최대 ctx | 캐시 읽기 | 캐시 쓰기 | 출력 |
|---|---:|---:|---:|---:|---:|---:|
| 메인 | 12 | 78,556 | 88,514 | 978,244 | 30,411 | 2,342 |
| 하위: 8단계 | 44 | 51,892 | 129,164 | 4,418,100 | 129,162 | 21,583 |
| 하위: 9단계 | 18 | 51,884 | 93,751 | 1,337,374 | 54,627 | 12,841 |
| 하위: 10단계 | 38 | 51,881 | 96,462 | 2,982,912 | 57,338 | 8,196 |

시작 ctx = 첫 호출 입력(시스템 프롬프트·CLAUDE.md·메모리·도구 정의·지시문). 하위 에이전트마다 반복되는 고정 비용이다.

## 컨텍스트를 늘린 작업 종류 (전 구간 합)
| 종류 | 횟수 | 추가된 토큰 | 누적 비용 |
|---|---:|---:|---:|
| 알림: prompt_snapshot | 4 | 24,249 | 759,469 |
| 모델 응답(출력) | 108 | 43,999 | 756,151 |
| Read | 20 | 19,131 | 722,908 |
| Bash: 기타 | 25 | 32,484 | 672,849 |
| mcp__Claude_Browser__browser_batch | 28 | 23,633 | 405,485 |
| mcp__Claude_Browser__computer | 10 | 6,505 | 140,521 |
| Grep | 6 | 3,076 | 105,354 |
| 알림: total_tokens_reminder | 105 | 3,241 | 57,197 |
| Bash: 빌드·타입검사 | 6 | 1,717 | 34,503 |
| mcp__Claude_Browser__get_page_text | 2 | 1,051 | 32,085 |
| mcp__Claude_Browser__read_page | 1 | 973 | 21,413 |
| mcp__Claude_Browser__preview_start | 2 | 652 | 20,853 |
| Write | 10 | 857 | 16,093 |
| 알림: mcp_instructions_delta | 3 | 431 | 13,938 |
| mcp__Claude_Browser__find | 6 | 849 | 13,866 |
| 알림: agent_listing_delta | 3 | 394 | 12,750 |
| Edit | 8 | 636 | 10,425 |
| 사용자·지시 입력 | 3 | 1,544 | 9,489 |
| Agent | 3 | 1,255 | 8,928 |
| 알림: queued_command | 3 | 1,775 | 8,837 |

## 컨텍스트를 가장 많이 늘린 항목 상위 15
| 구간 | 종류 | 대상 | 추가 | 누적 비용 |
|---|---|---|---:|---:|
| 하위: 8단계 | 알림: prompt_snapshot |  | 7,699 | 331,051 |
| 하위: 9단계 | 알림: prompt_snapshot |  | 7,699 | 130,881 |
| 하위: 10단계 | 알림: prompt_snapshot |  | 7,699 | 284,858 |
| 하위: 8단계 | Read | docs/features/applications/human/mockups/calendar… | 5,798 | 237,721 |
| 하위: 9단계 | Bash: 기타 | cat features/applications/statuses.ts; sed -n 1,1… | 3,614 | 39,758 |
| 하위: 9단계 | Bash: 기타 | cat ai/plan/step-09.md ai/spec/req-home.md ai/log… | 3,116 | 46,737 |
| 하위: 8단계 | Bash: 기타 | cat components/common/Popover.tsx; cat components… | 2,966 | 103,803 |
| 하위: 8단계 | Bash: 기타 | sed -n 1,40p features/applications/statuses.ts; c… | 2,879 | 106,530 |
| 하위: 9단계 | Bash: 기타 | grep -n "home-apps" -A40 $M/home.html \| head -70;… | 2,397 | 33,557 |
| 하위: 9단계 | Bash: 기타 | grep -n 'id="home-summary"' -A14 $M/home.html; gr… | 2,324 | 27,893 |
| 하위: 8단계 | Read | apps/desktop/src/features/applications/schedule.ts | 2,162 | 84,303 |
| 하위: 8단계 | Bash: 기타 | grep -n "export" features/applications/statuses.t… | 2,057 | 78,173 |
| 하위: 8단계 | Bash: 기타 | grep -n "\| *9 *\|\\|\| *10 *\|\\|9단계\\|10단계" docs/featu… | 2,055 | 16,436 |
| 하위: 9단계 | Bash: 기타 | ls pages/home features/applications && cat pages/… | 2,000 | 25,995 |
| 하위: 8단계 | Bash: 기타 | cat calendar.css; grep -n "\-\-s-\\|^\.icon-btn\\|^… | 1,887 | 67,923 |

## 여러 번 읽은 파일 (중복 읽기 후보)
| 파일 | 횟수 | 합계 | 구간 |
|---|---:|---:|---|
| docs/features/applications/ai/logs/index.md | 2 | 1,827 | 하위: 8단계, 하위: 10단계 |
| docs/features/applications/notes.md | 2 | 1,379 | 하위: 8단계, 하위: 10단계 |
| .claude/commands/implement.md | 3 | 915 | 하위: 8단계, 하위: 9단계, 하위: 10단계 |

## 구간별 가장 큰 항목 3개
- 하위: 8단계: 알림: prompt_snapshot  (+7,699) · Read docs/features/applications/human/m… (+5,798) · Bash: 기타 cat components/common/Popover.tsx;… (+2,966)
- 하위: 9단계: 알림: prompt_snapshot  (+7,699) · Bash: 기타 cat features/applications/statuses… (+3,614) · Bash: 기타 cat ai/plan/step-09.md ai/spec/req… (+3,116)
- 하위: 10단계: 알림: prompt_snapshot  (+7,699) · Grep ^- D(2|4|5|6|8|10|11|12|13|15|16|1… (+1,631) · mcp__Claude_Browser__browser_batch {"actions":[{"name":"computer","in… (+1,490)
