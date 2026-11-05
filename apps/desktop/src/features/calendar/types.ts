/** 캘린더 개인 일정 데이터 모양 (calendar.json, D7). 태스크·지원 일정·깃발은 각 저장소의 것을 읽기만 한다. */

/**
 * 개인 일정 하나 (R21). 타이머·완료 상태가 없고 투데이 칸반에도 나오지 않는다 (R22).
 * 시간이 없으면 하루 종일 일정이다 (R25).
 */
export interface PersonalEvent {
  id: string; // crypto.randomUUID()
  title: string;
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD", 하루짜리는 start와 같다
  time: string | null; // "HH:mm" 시작 시각. 하루짜리일 때만 넣는다 (R26)
  createdAt: string; // ISO 시각
  updatedAt: string; // ISO 시각
}

export interface CalendarData {
  version: 1;
  events: PersonalEvent[];
}

/** updateEvent로 바꿀 수 있는 칸 */
export type PersonalEventPatch = Partial<Pick<PersonalEvent, "title" | "start" | "end" | "time">>;
