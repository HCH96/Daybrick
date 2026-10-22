# 토큰 보고서: applications /implement
세션 0656b3d2-7f94-4fda-82e3-bfc55123d54a · 2026-10-22 · 스크립트 `.claude/scripts/token-report.mjs`로 생성

읽는 법: 컨텍스트 = 호출 한 번에 모델이 읽는 입력 전체. 캐시 읽기는 싸고(약 0.1배), 캐시 쓰기는 비싸다(약 1.25배).
"누적 비용" = 그 항목의 크기 × 그 뒤에 남은 호출 수. 일찍 들어온 큰 항목일수록 이후 호출마다 다시 읽혀 비싸다.

## 총합
- API 호출 115회, 입력 10,258,380 (캐시 읽기 9,984,506 / 캐시 쓰기 273,640 / 새 입력 234), 출력 46,418 (생각 6,083)

## 구간별
| 구간 | 호출 | 시작 ctx | 최대 ctx | 캐시 읽기 | 캐시 쓰기 | 출력 |
|---|---:|---:|---:|---:|---:|---:|
| 메인 | 15 | 78,556 | 90,616 | 1,246,120 | 32,513 | 3,798 |
| 하위: 8단계 | 44 | 51,892 | 129,164 | 4,418,100 | 129,162 | 21,583 |
| 하위: 9단계 | 18 | 51,884 | 93,751 | 1,337,374 | 54,627 | 12,841 |
| 하위: 10단계 | 38 | 51,881 | 96,462 | 2,982,912 | 57,338 | 8,196 |

시작 ctx = 첫 호출 입력(시스템 프롬프트·CLAUDE.md·메모리·도구 정의·지시문). 하위 에이전트마다 반복되는 고정 비용이다.

## 세션별 시작 컨텍스트 구성 (추정)
| 항목 | 메인 | 하위: 8단계 | 하위: 9단계 | 하위: 10단계 |
|---|---:|---:|---:|---:|
| 도구 정의 | 53,811 | 42,156 | 42,152 | 42,150 |
| 스킬 목록 | 5,589 | 5,175 | 5,175 | 5,175 |
| 시스템 프롬프트 | 11,840 | 887 | 887 | 887 |
| 나중에 불러올 도구 이름 목록 | 2,464 | 2,204 | 2,204 | 2,204 |
| CLAUDE.md·메모리 (instructions) | 818 | 758 | 758 | 758 |
| 기타 알림 | 647 | 556 | 553 | 552 |
| 지시문 (사용자·명령) | 1,723 | 155 | 155 | 155 |
| 에이전트·MCP 안내 | 1,664 | 0 | 0 | 0 |
| **합계 (시작 ctx)** | 78,556 | 51,892 | 51,884 | 51,881 |
- 큰 도구 정의 (메인): 50개 중 Artifact 약 16,300 · PowerShell 약 4,900 · ScheduleWakeup 약 2,200 · mcp__ccd_turn__wrap_up 약 1,800
- 큰 도구 정의 (하위: 8단계, 하위: 9단계, 하위: 10단계): 44개 중 Artifact 약 15,100 · PowerShell 약 4,600 · mcp__ccd_turn__wrap_up 약 1,700 · Agent 약 1,700
- 기록에 남은 글자 수 비율로 나눈 값이다. `prompt_snapshot`은 기록 전용 항목이라 아래 분배에서는 뺐다.

## 세션별 분류 합계 (시작 이후 늘어난 컨텍스트)
| 분류 | 메인 | 하위: 8단계 | 하위: 9단계 | 하위: 10단계 |
|---|---:|---:|---:|---:|
| 문서 | 729 | 18,789 | 14,802 | 9,696 |
| 코드 | 0 | 15,001 | 7,765 | 281 |
| 브라우저 | 0 | 14,126 | 0 | 20,347 |
| 모델 출력 | 3,054 | 21,377 | 12,617 | 8,045 |
| 편집 | 614 | 1,111 | 258 | 322 |
| 빌드·검사 | 0 | 328 | 788 | 602 |
| git | 422 | 845 | 594 | 327 |
| 알림 | 4,148 | 5,696 | 5,042 | 4,961 |
| 지시 | 1,544 | 0 | 0 | 0 |
| 하위 에이전트 보고 | 1,255 | 0 | 0 | 0 |
| 기타 도구 | 294 | 0 | 0 | 0 |
| **합계** | 12,060 | 77,272 | 41,867 | 44,581 |
| **최대 ctx** | 90,616 | 129,164 | 93,751 | 96,462 |
- 문서 = docs/·.claude/·.md·.html·목업, 코드 = 그 밖의 파일. Bash는 명령에 적힌 경로로 나눈 추정이다. 합계가 (최대 ctx − 시작 ctx)와 다르면 그 차이는 줄어든 구간(압축 등) 때문이다.

## 세션별 읽은 문서·코드 (큰 순서 6개, 추가 토큰)
- 메인 문서: sed -n '/## 다음 진행/,/## 확인할/p' notes.md && gr… (+659) · sed -n '/## 다음 진행/,$p' docs/features/applica… (+71)
- 하위: 8단계 문서: docs/features/applications/human/mockups/cal… (+5,798) · .claude/commands/implement.md (+4,278) · grep -n "| *9 *|\|| *10 *|\|9단계\|10단계" docs/… (+2,055) · cat calendar.css; grep -n "\-\-s-\|^\.icon-b… (+1,887) · ^- D(1|2|4|5|6|7|8|10|11|12|13|15|16|17)\. @… (+929) · docs/features/applications/ai/logs/index.md (+844)
- 하위: 8단계 코드: cat components/common/Popover.tsx; cat compo… (+2,966) · sed -n 1,40p features/applications/statuses.… (+2,879) · apps/desktop/src/features/applications/sched… (+2,162) · grep -n "export" features/applications/statu… (+2,057) · find pages/applications features/application… (+1,776) · apps/desktop/src/pages/applications/Applicat… (+1,345)
- 하위: 9단계 문서: .claude/commands/implement.md (+4,278) · cat ai/plan/step-09.md ai/spec/req-home.md a… (+3,116) · grep -n "home-apps" -A40 $M/home.html | head… (+2,397) · grep -n 'id="home-summary"' -A14 $M/home.htm… (+2,324) · cat notes.md && cat ai/logs/index.md (+1,518) · grep -n "10\b\|step-10" docs/features/applic… (+826)
- 하위: 9단계 코드: cat features/applications/statuses.ts; sed -… (+3,614) · ls pages/home features/applications && cat p… (+2,000) · grep -rn "DataState" features/applications/*… (+1,406) · apps/desktop/src/pages/home/SummaryStrip.tsx (+629) · apps/desktop/src/pages/home/dashboardCards.t… (+116)
- 하위: 10단계 문서: .claude/commands/implement.md (+4,278) · ^- D(2|4|5|6|8|10|11|12|13|15|16|17|18|19)\.… (+1,631) · docs/features/applications/ai/logs/index.md (+983) · docs/features/applications/ai/logs/L14.md (+982) · docs/features/applications/ai/logs/L15.md (+742) · docs/features/applications/notes.md (+648)
- 하위: 10단계 코드: localStorage @ apps/desktop/src (+281)

## 컨텍스트를 늘린 작업 종류 (전 구간 합)
| 종류 | 횟수 | 추가된 토큰 | 누적 비용 |
|---|---:|---:|---:|
| Read | 20 | 31,049 | 1,108,246 |
| 모델 응답(출력) | 111 | 45,093 | 764,367 |
| Bash: 기타 | 27 | 33,751 | 683,697 |
| mcp__Claude_Browser__browser_batch | 28 | 23,633 | 405,485 |
| 알림: mcp_instructions_delta | 3 | 6,045 | 195,470 |
| 알림: agent_listing_delta | 3 | 5,530 | 178,799 |
| mcp__Claude_Browser__computer | 10 | 6,505 | 140,521 |
| Grep | 6 | 3,076 | 105,354 |
| 알림: total_tokens_reminder | 108 | 3,555 | 64,208 |
| Bash: 빌드·타입검사 | 6 | 1,717 | 34,503 |
| mcp__Claude_Browser__get_page_text | 2 | 1,051 | 32,085 |
| mcp__Claude_Browser__read_page | 1 | 973 | 21,413 |
| mcp__Claude_Browser__preview_start | 2 | 652 | 20,853 |
| Write | 10 | 857 | 16,093 |
| 알림: queued_command | 3 | 1,775 | 14,162 |
| 사용자·지시 입력 | 3 | 1,544 | 14,122 |
| mcp__Claude_Browser__find | 6 | 849 | 13,866 |
| Agent | 3 | 1,255 | 12,692 |
| 알림: deferred_tools_delta | 1 | 967 | 11,599 |
| Edit | 8 | 636 | 10,425 |

## 컨텍스트를 가장 많이 늘린 항목 상위 15
| 구간 | 종류 | 대상 | 추가 | 누적 비용 |
|---|---|---|---:|---:|
| 하위: 8단계 | Read | docs/features/applications/human/mockups/calendar… | 5,798 | 237,721 |
| 하위: 8단계 | Read | .claude/commands/implement.md | 4,278 | 183,936 |
| 하위: 9단계 | Read | .claude/commands/implement.md | 4,278 | 72,719 |
| 하위: 10단계 | Read | .claude/commands/implement.md | 4,278 | 158,270 |
| 하위: 9단계 | Bash: 기타 | cat features/applications/statuses.ts; sed -n 1,1… | 3,614 | 39,758 |
| 하위: 9단계 | Bash: 기타 | cat ai/plan/step-09.md ai/spec/req-home.md ai/log… | 3,116 | 46,737 |
| 하위: 8단계 | Bash: 기타 | cat components/common/Popover.tsx; cat components… | 2,966 | 103,803 |
| 하위: 8단계 | Bash: 기타 | sed -n 1,40p features/applications/statuses.ts; c… | 2,879 | 106,530 |
| 하위: 9단계 | Bash: 기타 | grep -n "home-apps" -A40 $M/home.html \| head -70;… | 2,397 | 33,557 |
| 하위: 9단계 | Bash: 기타 | grep -n 'id="home-summary"' -A14 $M/home.html; gr… | 2,324 | 27,893 |
| 하위: 8단계 | Read | apps/desktop/src/features/applications/schedule.ts | 2,162 | 84,303 |
| 하위: 8단계 | Bash: 기타 | grep -n "export" features/applications/statuses.t… | 2,057 | 78,173 |
| 하위: 8단계 | Bash: 기타 | grep -n "\| *9 *\|\\|\| *10 *\|\\|9단계\\|10단계" docs/featu… | 2,055 | 16,436 |
| 하위: 8단계 | 알림: mcp_instructions_delta |  | 2,015 | 86,652 |
| 하위: 9단계 | 알림: mcp_instructions_delta |  | 2,015 | 34,258 |

## 여러 번 읽은 파일 (중복 읽기 후보)
| 파일 | 횟수 | 합계 | 구간 |
|---|---:|---:|---|
| .claude/commands/implement.md | 3 | 12,833 | 하위: 8단계, 하위: 9단계, 하위: 10단계 |
| docs/features/applications/ai/logs/index.md | 2 | 1,827 | 하위: 8단계, 하위: 10단계 |
| docs/features/applications/notes.md | 2 | 1,379 | 하위: 8단계, 하위: 10단계 |

## 구간별 가장 큰 항목 3개
- 하위: 8단계: Read docs/features/applications/human/m… (+5,798) · Read .claude/commands/implement.md (+4,278) · Bash: 기타 cat components/common/Popover.tsx;… (+2,966)
- 하위: 9단계: Read .claude/commands/implement.md (+4,278) · Bash: 기타 cat features/applications/statuses… (+3,614) · Bash: 기타 cat ai/plan/step-09.md ai/spec/req… (+3,116)
- 하위: 10단계: Read .claude/commands/implement.md (+4,278) · 알림: mcp_instructions_delta  (+2,015) · 알림: agent_listing_delta  (+1,843)
