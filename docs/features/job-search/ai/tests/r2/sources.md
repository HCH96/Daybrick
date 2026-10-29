# r2 AI 테스트: 자사 사이트 설정·같은 사이트 두 번 추가 (A11)

## A11. 자사 스위치·사이트 추가·같은 어댑터/주소 중복 추가
- 테스트 내용: 자사 스위치 저장 경로, 사이트 추가 때 자사 체크 전달, 같은 어댑터(게임잡)·같은 주소로 사이트를 하나 더 추가할 수 있는지, 그렇게 만든 두 사이트의 같은 공고가 수집 때 묶이는지
- 근거 요구사항: R28, R90
- 수행 방법: `features/job-search/api.ts`의 `setSiteOwn`·`addSite`·`loadSources`, `pages/job-search/sources/SiteTable.tsx`(스위치)·`SourcesTab.tsx`(`toggleOwn`)·`AddSiteForm.tsx`·`AddSiteDialog.tsx`·`addSiteRules.ts`, 0003 `js_sites` 정의·RLS, 0007, `js-collect/index.ts`의 `saveNew`·`findReps` 읽기 (코드 추적, 실제로 사이트를 더해 보지는 않음)
- 예상 결과: 저장 경로 확인, 중복 추가 가능 여부와 묶임 여부를 명확히 보고
- 실제 결과:
  - 자사 스위치: 표의 `role="switch"` 단추 → `toggleOwn` → `setSiteOwn`이 `js_sites.update({ own_site })` → 다시 읽기. 실패하면 오류 문구. RLS는 0003의 본인 행 정책(for all)이라 막히지 않음. 수집(`run`의 사이트 조회 `own_site`)·처리(`ownSites`)가 매번 DB에서 읽으므로 다음 판정부터 적용(R90)
  - 사이트 추가: 폼 체크박스 `ownSite`(기본 false) → `AddSiteDialog`가 `addSite(…, { ownSite: input.ownSite })` → insert에 `own_site` 포함
  - **중복 추가 가능 여부: 가능하다.** `js_sites`에는 이름·주소·어댑터에 대한 고유 제약이 없다(기본 키 id뿐, 0004–0007에도 추가 없음). 앱 검사(`addSiteRules.ts`)도 이름이 비었는지·http(s) 주소인지·어댑터/규칙 파일·변수만 보고, 이미 있는 사이트와 같은지는 보지 않는다. 그래서 기존 어댑터 "gamejob"을 고르고 같은 주소·같은 dutyCode로 두 번째 게임잡 사이트를 만들 수 있다
  - **묶임 여부: 묶인다 (코드 추적).** 같은 실행에서 사이트 1이 먼저 저장된 뒤 사이트 2의 `saveNew`가 돈다. ext_id 확인은 `site_id`별이라 사이트 2에는 모두 새 공고이고, `findReps`가 같은 norm_key(회사 정리값|정리 제목, 두 사이트가 같은 목록을 읽어 같음)를 가진 사이트 1 공고를 다른 사이트로 찾아 `stage duplicate`·`dup_of`로 넣는다. 원문을 받지 않고 AI 처리도 없다. 응답은 사이트 2 `added 0`·`bundled N`. 둘 중 하나만 자사로 켜 두면 자사 쪽 공고로 대표가 바뀐다. 회사·제목이 비어 norm_key가 null인 공고는 수집 때 묶이지 않고, 처리 단계 `checkDuplicate`(다른 사이트+회사·마감·제목 판정)에서 다시 묶일 수 있다. 회사 이름이 2글자 미만이면 묶이지 않는다
  - 참고로 수집 단계 norm_key에는 마감이 들어가지 않는다(회사+제목만). 마감은 처리 단계·소급의 `isSameJob`에서만 본다
- 판정: **통과** (저장 경로 확인됨, 중복 추가 가능·수집 때 묶임)
- 참고: 같은 사이트를 실수로 두 번 넣어도 카드는 하나로 보이지만, 출처 줄에 "게임잡 · 게임잡"처럼 같은 이름이 두 번 나오고 목록 요청이 두 배가 된다. 막으려면 앱 검사나 DB 고유 제약을 더해야 한다(현재 요구사항에는 없음).
