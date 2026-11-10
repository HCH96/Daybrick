# 데이터 동기화 (data-sync)
PC 앱의 로컬 JSON(플랜·캘린더·지원 관리·투데이)을 사용자 본인 Supabase에 기능별 한 행씩 올려, 나중에 웹·폰이 읽을 수 있게 한다.

- 상태: 테스트 중 (AI r1 통과, 사용자 테스트 대기)
- 선행 기능: server-setup (연결·로그인·서버 구조 번호)

## 문서 색인 (필요한 색인만 열고, 거기서 필요한 파일만 읽기)
| 종류 | 색인 | 내용 |
|---|---|---|
| 명세서 | [ai/spec/index.md](ai/spec/index.md) | 요구사항 묶음별 파일(R1–R33), 데이터, 범위, 결정 사항(D1–D9) |
| 구현 계획 | [ai/plan/index.md](ai/plan/index.md) | 7단계, 파일 목록·구조(structure.md), 단계별 step 파일 |
| 진행 기록 | [ai/logs/index.md](ai/logs/index.md) | 기록 목차, 항목별 파일 L01~ |
| 작업 노트 | [notes.md](notes.md) | 다음 단계와 읽을 문서 |
| 목업 | (아직 없음) | |
| AI 테스트 | [ai/tests/r1/index.md](ai/tests/r1/index.md) | r1 AI 테스트 보고서 (통과 25 · 실패 0) |
| 사용자 테스트 | [human/tests/r1-user-test.md](human/tests/r1-user-test.md) | r1 사용자 테스트 체크리스트 (28개, 결과 대기) |
