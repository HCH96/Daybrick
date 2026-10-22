import type { Application, ApplicationsData, PropertyDef, ScheduleEvent } from "./types";

/**
 * 저장 파일 형식 옮기기 (D20). 화면과 무관한 순수 함수만 둔다.
 * 앱을 열 때 storage.ts가 옛 버전을 읽으면 여기서 새 버전으로 바꾸고 곧바로 저장한다 (백업 없음).
 */

/** v1의 기본 속성 id (역할이 아니라 id로 찾는다. 사용자가 지웠으면 값도 없다) */
const V1_DEADLINE_ID = "deadline";
const V1_APPLIED_DATE_ID = "applied-date";
/** v1에만 있던 일정 종류 */
const V1_APPLIED_KIND = "applied";

/** v1 파일 모양: v2와 같고, 일정 종류에 "applied", 속성 역할에 deadline·appliedDate가 더 있다 */
interface V1Data {
  version: 1;
  properties: (Omit<PropertyDef, "role"> & { role: string | null })[];
  applications: (Omit<Application, "events"> & { events: (Omit<ScheduleEvent, "kind"> & { kind: string })[] })[];
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * v1 → v2 (R40):
 * - 마감일 값은 상태와 상관없이 "지원 마감" 일정 하나로 옮긴다 (시간·메모 없음).
 * - 지원일 값과 "지원 완료" 일정은 지운다.
 * - 마감일·지원일 속성 정의를 지운다.
 * newId는 새 일정 id를 만드는 함수 (부르는 쪽에서 넣는다).
 */
export function migrateV1ToV2(raw: V1Data, newId: () => string): ApplicationsData {
  const removed = new Set([V1_DEADLINE_ID, V1_APPLIED_DATE_ID]);

  const properties: PropertyDef[] = raw.properties
    .filter((p) => !removed.has(p.id))
    .map((p) => ({ ...p, role: p.role === "priority" || p.role === "result" || p.role === "company" ? p.role : null }));

  const applications: Application[] = raw.applications.map((app) => {
    const values = { ...app.values };
    const deadline = values[V1_DEADLINE_ID];
    delete values[V1_DEADLINE_ID];
    delete values[V1_APPLIED_DATE_ID];

    const events: ScheduleEvent[] = app.events
      .filter((e) => e.kind !== V1_APPLIED_KIND)
      .map((e) => ({ ...e, kind: e.kind as ScheduleEvent["kind"] }));
    if (isDateKey(deadline)) {
      events.push({ id: newId(), kind: "application-due", date: deadline, time: null, memo: "" });
    }
    return { ...app, values, events };
  });

  return { version: 2, properties, applications };
}

/** 파일에서 읽은 객체가 v1인지 */
export function isV1Data(value: { version?: unknown }): value is V1Data {
  return value.version === 1;
}
