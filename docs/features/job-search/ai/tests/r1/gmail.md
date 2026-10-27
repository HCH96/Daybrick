# r1 Gmail 연동·메일 제안 (A35–A39, A42, req-gmail)

## A35 토큰 암호화·해제
- 테스트 내용: Gmail 토큰 AES-GCM 왕복, 해제 때 revoke 실패해도 행 삭제
- 근거 요구사항: R62, R63
- 수행 방법: t2-flow에서 token.ts `sealToken`·`openToken`, js-gmail connect·disconnect (Google 토큰·revoke 주소는 가짜 응답)
- 예상 결과: 복원·삭제
- 실제 결과: 복원하면 원래 토큰, 매번 다른 iv, 암호문에 원문 없음, 다른 키·모양이 틀린 키 → null. connect는 cipher·iv만 저장하고 응답 `{ ok, email }`에 토큰 없음. revoke 요청이 실패해도 `{ ok: true, revoked: false }`를 돌려주고 행 삭제
- 판정: 통과

## A36 메일 고르기
- 테스트 내용: 진행 중 지원 건 회사·도메인과 맞는 메일만, 종료 건 제외
- 근거 요구사항: R59, R65
- 수행 방법: check.ts 읽기, t2-flow에서 메일 7통과 지원 건 3개(넥슨 도메인, 스마일게이트 이름만, 종료한 엔씨소프트)로 check
- 예상 결과: 관계없는 메일은 AI에 안 감
- 실제 결과: 본문 요청과 AI 분류는 m1(careers.nexon.com 하위 도메인)·m2(보낸 사람 이름에 회사명)·m5·m6·m7만. 종료 건 메일 m3과 광고 m4는 본문도 받지 않음. scanned 7·matched 5
- 판정: 통과

## A37 분류 → 제안 상태 매핑
- 테스트 내용: 5종
- 근거 요구사항: R67, R68
- 수행 방법: check.ts `CATEGORY_STATUS`·`toSuggestion` 읽기, t2-flow check, t1-pure에서 앱 `planSuggestion`
- 예상 결과: 명세 표와 같음
- 실제 결과: 다음 전형 → 전형 준비+세부 단계(coding-test)+일정(2026-11-10 10:00), 응시 확인 → 결과 대기+세부 단계(interview), 불합격 → 종료+결과 "불합격", 최종 합격 → 종료+결과 "최종 합격", 기타 → 제안 없음. 결과 속성 값은 앱 승인 때 넣음
- 판정: 통과

## A38 메일 제안 저장 칸
- 테스트 내용: 제목·보낸 사람·받은 날·발췌만
- 근거 요구사항: R69
- 수행 방법: 0003 `js_mail_suggestions` 정의 읽기, t2-flow에서 넣은 행의 칸·값 확인
- 예상 결과: 본문 칸 없음
- 실제 결과: 칸은 application_id·subject·sender·received_at·category·from_status·to_status·stage·schedule·quote·state(+id·user_id). 본문 표시가 저장 값 어디에도 없음. 발췌의 주소는 지워짐("코딩테스트 안내 참고")
- 판정: 통과

## A39 토큰 거절
- 테스트 내용: broken_at 기록, 확인 멈춤, 처음 끊길 때만 알림
- 근거 요구사항: R70
- 수행 방법: token.ts `markBroken`, 0004 `js_cron_mail` 읽기. t2-flow에서 Google이 `invalid_grant`를 돌려주게 하고 check 두 번
- 예상 결과: 맞음
- 실제 결과: 첫 번째 `{ ok: false, reason: "rejected" }` + broken_at 기록 + "Gmail 연결 끊김" 알림(설정 탭). 두 번째는 Google에 요청하지 않고 not-connected, 알림 없음. 예약 작업은 `broken_at is null`일 때만 부름
- 판정: 통과

## A42 Gmail 권한
- 테스트 내용: Gmail 연결 요청 권한이 gmail.readonly 하나
- 근거 요구사항: R60
- 수행 방법: gmailConnect.ts 읽기, t2-flow에서 권한 없이 받은 토큰으로 connect
- 예상 결과: 맞음
- 실제 결과: 요청 scopes는 `email https://www.googleapis.com/auth/gmail.readonly`. Gmail 권한은 gmail.readonly 하나뿐이고 `email`은 로그인 계정 확인용 기본 범위. 서버는 gmail.readonly가 실제로 허락되지 않으면 `no-scope`로 거절하고 권한을 취소하며 저장하지 않음
- 판정: 통과
