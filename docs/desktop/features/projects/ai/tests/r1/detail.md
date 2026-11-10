# 상세 화면 계산 (req-detail, A2·A5)

## A2 진행 계산: 단계 3개(5/5, 2/6, 0/0)
- 테스트 내용: 단계형 프로젝트에서 현재 단계, 캐릭터 위치, 태스크가 없는 단계의 끝남 여부
- 근거 요구사항: R16, R17, R23
- 수행 방법: features/projects/progress.ts `currentStage`·`runnerPosition`·`isStageDone`·`isProjectDone`을 실행
- 예상 결과: 현재 단계 2번째, 캐릭터 위치 1.33, 태스크 0개 단계는 끝나지 않음
- 실제 결과: currentStage = 1(0부터 세므로 2번째 단계), runnerPosition = 1.33(1 + 2/6), s3(0개)는 끝나지 않음(false), s1은 끝남(true), 프로젝트는 완료 아님
- 판정: 통과

## A5 마지막 작업일·누적 시간
- 테스트 내용: 마지막 작업일 글자와, 실행 중 타이머를 더한 누적 시간
- 근거 요구사항: R26, R28
- 수행 방법: campfire.ts `formatLastWork`, time.ts `projectSlices`·`projectTotal`·`dayTotalsByProject`·`lastWorkDay`를 실행. today/stats.ts `collectSlices`(실행 중 구간은 now까지)를 읽음. 준비한 기록: 오늘 30분 끝난 기록, 11/2 30초 기록, 카테고리 태스크 60분, 실행 중 타이머(끝난 구간 10분 + 열린 구간 20분)
- 예상 결과: "오늘/어제/N일 전/아직 없음", 누적에 실행 중 타이머 더함
- 실제 결과: 글자 ["오늘","어제","3일 전","아직 없음"]. 누적 60.5분(30 + 0.5 + 10 + 20)이고 카테고리 태스크 시간은 빠짐. 마지막 작업일 2026-11-05. 1분 미만 기록만 있는 날은 null(작업일 아님)
- 판정: 통과
