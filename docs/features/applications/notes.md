# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 1단계: 저장 기반 + 페이지 뼈대 (사용자 확인 완료)
- 2단계: 갤러리 (사용자 확인 완료)
- 3단계: 상세 팝업 틀 (사용자 확인 완료)
- 4단계: 속성 (사용자 확인 완료)
- 5단계: 상태 (사용자 확인 완료)
- 6단계: 전형 일정 창 (사용자 확인 완료)

## 다음 진행
- 7단계: 본문 편집기 (Tiptap 마크다운 본문, 캡처 이미지 붙여 넣기 → `images/` 저장, Rust `save_image`·asset 프로토콜)
- 관련 결정: D1, D2, D4, D5, D6, D8, D10, D11, D12, D13, D15, D16 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 지금 상세 팝업 본문 자리는 "본문은 다음 단계에서 만들어요" 자리 표시 글이다(`ApplicationDetailModal`). 본문 저장은 `updateApplication(id, { body })`를 쓴다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-body.md
- ai/logs/L12.md
- human/mockups/popup.html의 popup-body 구역 (CSS: popup.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 `pages/applications/detail/` 줄 (MarkdownBody 위치를 정할 때만)
