# 구직 관리 수정1 4단계: 수집 단계에서 묶기

- 요구사항: R35, R82, R86–R88 (영향: R39 원문 다시 받지 않기, R33 예약 이어 하기)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D31, D43, D52, D53, D54, D57

## 할 일
`supabase/functions/js-collect/index.ts`
- `saveNew`: 지금은 다른 사이트에 같은 `norm_key`가 있으면 넣지 않는다(`taken`). 바꿔서:
  - 일치한 공고의 묶음 대표(`dup_of ?? id`)를 찾고, 새 공고를 `stage duplicate, dup_of = 대표, body_text null`로 넣는다 (R82: 원문·AI 처리 없음).
  - 대표 사이트의 `own_site`가 false, 새 공고 사이트가 true이고, 대표가 지원하지 않은 공고(`applied_at` null)이면 `js_switch_rep(user, 대표, 새 공고)` (R87). 새 대표는 body_text가 null이라 이어지는 `fetchBodies`가 원문만 받는다.
  - 숨긴 대표에 묶이면 출처만 늘어난다(R88). hidden_at은 대표에 남는다.
  - 일치 후보 조회에서 `unbundled = true` 공고는 빼고(D57), 대표와 묶인 공고 모두 norm_key로 찾는다.
  - 같은 사이트 판정(`ext_id`)은 그대로.
  - 이번 실행에서 같은 norm_key가 두 사이트에서 함께 들어오면 먼저 처리한 사이트의 공고가 대표가 되고, 다음 사이트의 공고가 위 규칙으로 묶인다.
- `fetchBodies`·`bodiesOnly`: `stage <> 'duplicate'`인 공고만 원문을 받는다.
- 응답 `sites[].added`는 새 대표·단독 공고 수만, 묶인 수는 `bundled`로 따로 (앱 결과 줄은 그대로 `added`를 씀).

## 확인할 결과
- 앱 [서버 업데이트] 성공 (js-collect 다시 배포).
- 스마일게이트(custom 규칙, 자사 켬)와 게임잡을 켜고 [지금 수집]. SQL:
  `select p.title, s.name, p.stage, p.dup_of, p.body_text is null as no_body from js_postings p join js_sites s on s.id = p.site_id where p.dup_of is not null`
  → 같은 공고 쌍이 있으면 행이 나오고 `no_body` true.
- 게임잡 공고가 먼저 있던 묶음에 자사 공고가 들어온 경우: 자사 공고가 대표(`dup_of` null)이고 stage가 옛 대표와 같으며, 다음 원문 받기 뒤 body_text가 채워짐. 옛 대표는 duplicate.
- 같은 사이트를 다시 [지금 수집] → 새 공고 0 (R35 같은 사이트 규칙 회귀 없음). 묶인 공고의 원문을 받지 않음(`js-collect bodies` 뒤에도 no_body 그대로).
- 예약 이어 하기 조건: 묶인 공고만 원문이 없을 때 `js_cron_continue`가 `js-collect bodies`를 부르지 않는다 (`select ... from js_postings where body_text is null and stage <> 'duplicate'`가 0이면 호출 없음, `net._http_response` 확인).
- 실제 사이트에 같은 공고 쌍이 없으면 그 사실을 기록하고, SQL로 넣은 시험 행(같은 회사·제목, 다른 사이트)으로 확인한다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/js-collect/index.ts`
