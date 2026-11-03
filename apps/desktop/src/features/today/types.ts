/** 투데이 데이터 모양 (today.json, D8). 태스크는 플랜 저장소의 것을 쓰고 여기에는 시간 기록만 쌓는다 (D3). */

/** 끝난 시간 구간 하나. 합계는 저장하지 않고 이것들로 계산한다. */
export interface TimeRecord {
  id: string; // crypto.randomUUID()
  taskId: string;
  start: string; // ISO 시각
  end: string; // ISO 시각
}

/** 실행 중 타이머의 구간. 마지막 구간만 end가 null일 수 있다 (running일 때). */
export interface TimerSegment {
  start: string;
  end: string | null;
}

/** 지금 돌고 있거나 일시정지한 타이머 (앱을 다시 켜도 남는다) */
export interface RunningTimer {
  taskId: string;
  state: "running" | "paused";
  segments: TimerSegment[];
  lastSeenAt: string; // R25: 1분마다·창 닫을 때 적는 마지막 확인 시각
}

export interface TodaySettings {
  dailyGoalMinutes: number; // 기본 360 (D4), 1~1440
}

export interface TodayData {
  version: 1;
  records: TimeRecord[];
  running: RunningTimer | null;
  settings: TodaySettings;
}
