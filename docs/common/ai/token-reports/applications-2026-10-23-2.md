# 토큰 보고서: applications /test (Test applications 세션)
세션 6a8c6064-7cf7-4cbe-858b-48845a6f6da5 · 2026-10-22 · 스크립트 `.claude/scripts/token-report.mjs`로 생성

읽는 법: 컨텍스트 = 호출 한 번에 모델이 읽는 입력 전체. 캐시 읽기는 싸고(약 0.1배), 캐시 쓰기는 비싸다(약 1.25배).
"누적 비용" = 그 항목의 크기 × 그 뒤에 남은 호출 수. 일찍 들어온 큰 항목일수록 이후 호출마다 다시 읽혀 비싸다.

## 총합
- API 호출 39회, 입력 5,821,214 (캐시 읽기 5,666,467 / 캐시 쓰기 154,669 / 새 입력 78), 출력 64,318 (생각 8,119)

## 구간별
| 구간 | 호출 | 시작 ctx | 최대 ctx | 캐시 읽기 | 캐시 쓰기 | 출력 |
|---|---:|---:|---:|---:|---:|---:|
| 메인 | 39 | 75,389 | 212,772 | 5,666,467 | 154,669 | 64,318 |

시작 ctx = 첫 호출 입력(시스템 프롬프트·CLAUDE.md·메모리·도구 정의·지시문). 하위 에이전트마다 반복되는 고정 비용이다.

## 세션별 시작 컨텍스트 구성 (추정)
| 항목 | 메인 |
|---|---:|
| 도구 정의 | 52,295 |
| 시스템 프롬프트 | 11,506 |
| 스킬 목록 | 5,431 |
| 나중에 불러올 도구 이름 목록 | 2,394 |
| 에이전트·MCP 안내 | 1,659 |
| 지시문 (사용자·명령) | 767 |
| CLAUDE.md·메모리 (instructions) | 694 |
| 기타 알림 | 641 |
| **합계 (시작 ctx)** | 75,389 |
- 큰 도구 정의 (메인): 50개 중 Artifact 약 15,800 · PowerShell 약 4,800 · ScheduleWakeup 약 2,100 · mcp__ccd_turn__wrap_up 약 1,700
- 기록에 남은 글자 수 비율로 나눈 값이다. `prompt_snapshot`은 기록 전용 항목이라 아래 분배에서는 뺐다.

## 세션별 분류 합계 (시작 이후 늘어난 컨텍스트)
| 분류 | 메인 |
|---|---:|
| 문서 | 16,846 |
| 코드 | 47,078 |
| 모델 출력 | 63,989 |
| 편집 | 3,797 |
| 빌드·검사 | 1,279 |
| git | 188 |
| 알림 | 3,691 |
| 지시 | 59 |
| 기타 도구 | 456 |
| **합계** | 137,383 |
| **최대 ctx** | 212,772 |
- 문서 = docs/·.claude/·.md·.html·목업, 코드 = 그 밖의 파일. Bash는 명령에 적힌 경로로 나눈 추정이다. 합계가 (최대 ctx − 시작 ctx)와 다르면 그 차이는 줄어든 구간(압축 등) 때문이다.

## 세션별 읽은 문서·코드 (큰 순서 6개, 추가 토큰)
- 메인 문서: find . -type f | sort && cat index.md && cat… (+4,015) · cat spec/req-*.md spec/scope.md (+3,440) · wc -l spec/decisions.md spec/mockup.md spec/… (+2,102) · cat spec/mockup.md spec/data.md (+1,910) · for f in plan/step-*.md; do echo "=== $f"; a… (+1,849) · grep -n "identifier\|productName\|\"width\"\… (+1,455)
- 메인 코드: for f in properties.ts propertyOps.ts proper… (+9,006) · for f in ApplicationsPage.tsx gallery/Galler… (+8,612) · for f in types statuses transitions schedule… (+8,068) · for f in src/features/applications/store.tsx… (+6,608) · find $S -path '*applications*' -type f | xar… (+4,734) · grep -rln "summarizeApplications" $D; P=$D/p… (+2,841)

## 컨텍스트를 늘린 작업 종류 (전 구간 합)
| 종류 | 횟수 | 추가된 토큰 | 누적 비용 |
|---|---:|---:|---:|
| Bash: 기타 | 25 | 65,326 | 1,753,649 |
| 모델 응답(출력) | 38 | 63,989 | 996,673 |
| 알림: total_tokens_reminder | 38 | 1,894 | 39,430 |
| 알림: environment | 3 | 1,031 | 32,854 |
| Write | 15 | 1,598 | 18,859 |
| Bash: 빌드·타입검사 | 4 | 1,279 | 14,091 |
| Edit | 11 | 798 | 5,801 |
| 알림: silent_turn_reminder | 2 | 183 | 5,437 |
| mcp__ccd_turn__wrap_up | 3 | 265 | 3,753 |
| 알림: hook_additional_context | 1 | 197 | 3,155 |
| mcp__ccd_turn__update_plan | 4 | 191 | 3,066 |
| 알림: deferred_tools_record | 4 | 386 | 2,280 |
| 사용자·지시 입력 | 2 | 59 | 1,432 |
| Bash: git | 1 | 188 | 564 |

## 컨텍스트를 가장 많이 늘린 항목 상위 15
| 구간 | 종류 | 대상 | 추가 | 누적 비용 |
|---|---|---|---:|---:|
| 메인 | Bash: 기타 | for f in properties.ts propertyOps.ts propertyRed… | 9,006 | 243,166 |
| 메인 | Bash: 기타 | for f in ApplicationsPage.tsx gallery/GalleryView… | 8,612 | 198,080 |
| 메인 | Bash: 기타 | for f in types statuses transitions schedule summ… | 8,068 | 225,906 |
| 메인 | Bash: 기타 | for f in src/features/applications/store.tsx src/… | 6,608 | 171,819 |
| 메인 | Bash: 기타 | find $S -path '*applications*' -type f \| xargs wc… | 4,734 | 137,295 |
| 메인 | Bash: 기타 | find . -type f \| sort && cat index.md && cat ai/s… | 4,015 | 152,565 |
| 메인 | Bash: 기타 | cat spec/req-*.md spec/scope.md | 3,440 | 127,281 |
| 메인 | Bash: 기타 | grep -rln "summarizeApplications" $D; P=$D/pages/… | 2,841 | 62,493 |
| 메인 | Bash: 기타 | wc -l spec/decisions.md spec/mockup.md spec/data.… | 2,102 | 71,451 |
| 메인 | Bash: 기타 | cat -n $T/src/storage.rs; grep -n "asset\\|scope\\|… | 2,069 | 51,721 |
| 메인 | Bash: 기타 | cat spec/mockup.md spec/data.md | 1,910 | 63,030 |
| 메인 | Bash: 기타 | for f in plan/step-*.md; do echo "=== $f"; awk '/… | 1,849 | 68,400 |
| 메인 | Bash: 기타 | node --import "file:///$SP/register.mjs" "$SP/run… | 1,711 | 25,670 |
| 메인 | Bash: 기타 | grep -n "identifier\\|productName\\|\"width\"\\|\"he… | 1,455 | 17,459 |
| 메인 | Bash: 기타 | cat -n $D/pages/home/ApplicationsSummaryCard.tsx;… | 1,400 | 29,390 |

## 여러 번 읽은 파일 (중복 읽기 후보)
- 없음

## 구간별 가장 큰 항목 3개

## 낭비 분석 (사람이 추가, 호출 기록을 하나씩 확인함)
비용 비중은 입력 1 기준 환산(캐시 읽기 0.1, 캐시 쓰기 1.25, 출력 5)으로 어림한 값이다. 전체 약 108만 환산 = 캐시 읽기 52% · 출력 30% · 캐시 쓰기 18%.

### 분명한 낭비 (약 7~8%)
| # | 무엇 | 낭비량 | 원인 | 줄이는 법 |
|---|---|---|---|---|
| 1 | 호출 22: 테스트 스크립트를 heredoc으로 Bash 명령에 넣었다가 실패(`unexpected EOF while looking for matching '`), 호출 23에서 Write로 다시 씀 | 출력 6,565 + 실패한 입력이 이후 17회 재읽힘 (약 4%) | 명령 길이(12,153자) 때문에 bash로 넘어가며 잘린 것으로 추정. 명령 자체는 `bash -n` 문법 검사를 통과했고, 프로젝트 전체 heredoc 호출 중 5,742자 이하는 성공, 8,198자·12,153자는 같은 오류로 실패 | 여러 줄 스크립트는 처음부터 Write로 파일을 만든 뒤 실행 (Write는 명령줄 길이 제한을 받지 않음) |
| 2 | 호출 1~4: 병렬 Bash 두 개가 상대 경로 `cd`를 써서 두 번째가 실패, `pwd`·재실행으로 2회 추가 | 호출 2회 ≈ 캐시 읽기 17만 (약 1.6%) | Bash의 현재 폴더가 호출 사이에 유지됨. 첫 명령이 `cd`한 뒤라 두 번째의 상대 경로가 틀어짐. `ls archive`는 폴더가 없어 종료 코드 2(결과는 정상) | 절대 경로 또는 `(cd 경로 && …)` 하위 셸 사용, 없을 수 있는 폴더는 `\|\| true` |
| 3 | 호출 29~31: 체크리스트를 다 쓴 뒤 화면 문구를 확인하고 6곳을 고침 | 출력 약 4,000 + 호출 2회 (약 2%) | 실제 화면 문구를 확인하기 전에 기억으로 씀 | 체크리스트에 넣을 버튼·제목 문구를 먼저 grep으로 모은 뒤 작성 |

### 줄일 여지가 있는 부분 (낭비는 아님)
- **코드 통째 읽기 (+47,078, 누적 약 115만 캐시 읽기 ≈ 11%)**: 호출 10~18에서 지원 관리 코드 거의 전부를 `cat -n`으로 읽었다. A4~A16 확인에 필요했지만 이 내용이 이후 문서 작성·커밋 호출 20여 회 내내 따라다녔다. 확인에 필요한 함수만 grep으로 읽거나, 코드 확인을 하위 에이전트에 맡기고 판정 요약만 받으면 메인 컨텍스트가 10만 안팎에서 멈췄을 것이다(추정, 하위 에이전트 시작 비용 약 7만이 새로 붙음).
- **시작 고정 비용 (75,389 × 39회 ≈ 캐시 읽기의 52%)**: 대부분 도구 정의(52,295). 이 세션에서 쓰지 않은 Artifact(약 15,800)·PowerShell(약 4,800)·ScheduleWakeup(약 2,100)만 약 2.3만이다. 앱이 넣는 도구라 프로젝트 문서로는 줄이기 어렵다.

### 잘 된 점
- 진행 기록은 명령 규칙대로 grep으로 세 줄만 모아 읽었고, 같은 파일을 두 번 읽은 적이 없다.
- 대화 압축 없이 최대 21만에서 끝났고, 생각 토큰도 8,119로 작다.
