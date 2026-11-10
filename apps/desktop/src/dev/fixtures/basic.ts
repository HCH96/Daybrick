/**
 * 예시 데이터 basic: 기능마다 몇 개씩 채운 보통 상태. 날짜는 모두 오늘 기준.
 * 서버는 연결하지 않은 상태이고, 첫 실행 안내는 넘긴 상태로 시작한다.
 * 들어 있는 것: 카테고리 3·태스크 11(오늘 할 일·진행 중·완료, 지난 미완료, 여러 날, 미정, 체크리스트, 지원 연결, 프로젝트 단계)
 * 프로젝트 2(주차형·단계형), 지원 카드 4(상태별 하나씩, 마감·면접·코딩테스트 일정), 개인 일정 3, 시간 기록 4
 */
import type { PreviewKind } from "../previewStore";
import { buildApplications, buildCalendar, INTERVIEW_APP_ID } from "./basicApplications";
import { buildPlan, buildToday } from "./basicPlan";

export function buildBasic(today: Date): Partial<Record<PreviewKind, unknown>> {
  return {
    server: { version: 1, connection: null, welcomeDismissed: true, lastCheck: null },
    plan: buildPlan(today, INTERVIEW_APP_ID),
    today: buildToday(today),
    applications: buildApplications(today),
    calendar: buildCalendar(today),
  };
}
