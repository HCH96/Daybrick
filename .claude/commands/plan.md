---
description: 기능 명세서를 읽고 구현 계획을 세운다 (코드 작성 없음)
argument-hint: <기능명>
---

"$ARGUMENTS" 기능의 구현 계획을 세워줘. 기능 폴더는 docs/features/<기능명>/ 이다.
- 명세서: ai/spec/index.md를 먼저 읽고, 계획에 필요한 req 파일·data.md·scope.md·decisions.md를 읽는다. 명세서를 찾지 못하면 계획을 세우지 말고 나에게 알려줘.
- 진행 기록: ai/logs/index.md(목차)를 확인하고 필요한 항목 파일만 읽는다.
- 목업: human/mockups/index.html 맨 앞 목업 목차를 보고 필요한 화면 파일만 읽는다.
- 다른 기능의 구조가 필요하면 그 기능의 index.md에서 필요한 파일만 찾는다 (예: 메인 페이지 ai/spec/extension.md).

아직 코드는 작성하지 마.

계획에는 다음을 넣어줘.
1. 만들거나 수정할 파일 목록 (파일마다 어느 단계에서 만드는지)
2. 컴포넌트 구조
3. 구현 순서 (단계별)
4. 단계마다 내가 확인할 수 있는 결과
5. 단계마다 참고할 목업 화면 파일과 관련 요구사항 번호 (예: `part-status.html`, R18–R19)

계획을 보여준 뒤 내가 승인하면 다음을 해줘.
- docs/features/<기능명>/ai/plan/에 나눠 저장:
  - index.md: 명세서·목업 링크, 작성일·상태, 계획 중 정한 결정과 작은 규칙, 단계 표(단계 → 이름 → step 파일 → R), 이번 계획에 넣지 않는 것 (40줄 안팎)
  - structure.md: 전체 파일 목록, 데이터 모양, 컴포넌트 구조, C++ 비유
  - step-NN.md: 단계 하나당 파일 하나. 요구사항(R), 목업 화면 파일, 할 일, 확인할 결과, 이 단계에서 만들거나 고칠 파일만 적는다
- ai/spec/index.md의 "다른 문서"에 계획 경로(승인 날짜)와 계획에서 정한 것 한두 줄을 기록
- 기능 허브(index.md)의 구현 계획 칸에 ai/plan/index.md 링크 추가
- 진행 기록에 "계획" 항목을 남기기 (docs/common/ai/formats/record-format.md의 "진행 기록 쓰는 법")
- 계획 중 정한 결정 중 앞으로 지켜야 할 것은 ai/spec/decisions.md에 D 번호로 올리기 (docs/common/ai/formats/record-format.md의 "결정 올리기")
- 같은 기능에 새 계획을 세울 때(이전 계획이 구현·테스트까지 끝난 뒤): 이전 plan/ 폴더를 archive/plan-<짧은 이름>/으로 옮기고 새 plan/을 만든다
