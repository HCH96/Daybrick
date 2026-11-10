import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadAppSettings } from "../background/api";
import { notify } from "../notifications/notify";
import { checkUpdate, markUpdateNotified, updaterInfo, type FoundUpdate, type UpdaterInfo } from "./api";
import { installDevUpdater } from "./devUpdater";
import { isCheckDue, shouldNotify } from "./logic";
import { newVersionNotice } from "./notices";

/** 첫 자동 확인은 화면이 뜨고 이만큼 뒤 (R1, D4) */
const FIRST_CHECK_DELAY_MS = 5_000;
/** 그 뒤 이 간격마다 24시간이 지났는지만 본다 (R2, D4) */
const DUE_POLL_MS = 60 * 60 * 1000;

/**
 * 업데이트 상태 (structure.md 3절). 실패 뒤에도 찾은 버전 정보는 남겨 버튼을 다시 누를 수 있다.
 * 받기·설치 쪽 상태는 5단계에서 쓴다.
 */
export type UpdaterPhase =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "upToDate" }
  | { kind: "checkFailed" }
  | ({ kind: "available" } & FoundUpdate)
  | ({ kind: "downloading"; percent: number | null } & FoundUpdate)
  | ({ kind: "downloadFailed" } & FoundUpdate)
  | ({ kind: "signatureFailed" } & FoundUpdate)
  | ({ kind: "installing" } & FoundUpdate);

export interface UpdaterStore {
  phase: UpdaterPhase;
  /** 지금 버전과 쓸 수 있는지. 읽기 전이면 null */
  info: UpdaterInfo | null;
  /** [업데이트 확인] 수동 확인 (R14) */
  checkNow: () => void;
  /** [설치하고 다시 시작] (R16). 받기·설치 흐름은 5단계에서 채운다 */
  install: () => void;
}

const UpdaterContext = createContext<UpdaterStore | null>(null);

/** 업데이트 상태. UpdaterProvider 밖이면 null */
export function useUpdater(): UpdaterStore | null {
  return useContext(UpdaterContext);
}

function isBusy(phase: UpdaterPhase): boolean {
  return phase.kind === "checking" || phase.kind === "downloading" || phase.kind === "installing";
}

/**
 * 새 버전 자동 확인과 알림 (자동 업데이트 R1, R2, R4–R9, R14, D3, D4). 화면은 없다.
 * - 켤 때 쓸 수 있으면(설치본) 5초 뒤 한 번, 그 뒤 1시간마다 24시간이 지났으면 확인한다.
 * - 자동 확인으로 찾은 버전은 한 번만 알린다. 실패는 콘솔에만 남기고 상태를 바꾸지 않는다 (R9).
 * - 수동 확인은 결과를 상태로 보이고, 찾은 버전은 알리지 않고 알린 버전으로만 적는다 (R14).
 */
export function UpdaterProvider({ children }: { children?: ReactNode }) {
  const [info, setInfo] = useState<UpdaterInfo | null>(null);
  const [phase, setPhaseState] = useState<UpdaterPhase>({ kind: "idle" });
  // 타이머 처리기는 한 번만 등록하므로 최신 값은 ref로 읽는다
  const phaseRef = useRef<UpdaterPhase>(phase);
  const lastCheckedRef = useRef<number | null>(null);
  const notifiedRef = useRef<string | null>(null);
  const settingsReadRef = useRef<Promise<void> | null>(null);

  const setPhase = useCallback((next: UpdaterPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  /** 알린 버전을 처음 한 번만 읽는다. 읽지 못하면 없는 것으로 본다 */
  const readNotified = useCallback((): Promise<void> => {
    if (!settingsReadRef.current) {
      settingsReadRef.current = loadAppSettings()
        .then((s) => {
          notifiedRef.current = s.notifiedUpdateVersion ?? null;
        })
        .catch((e: unknown) => console.error("앱 설정 읽기 실패 (알린 버전)", e));
    }
    return settingsReadRef.current;
  }, []);

  /** 알린 버전으로 적는다. 실패해도 이번 실행 동안은 ref로 다시 알리지 않는다 */
  const rememberNotified = useCallback((version: string) => {
    notifiedRef.current = version;
    void markUpdateNotified(version).catch((e: unknown) => console.error("알린 버전 저장 실패", e));
  }, []);

  const autoCheck = useCallback(async () => {
    if (isBusy(phaseRef.current)) return;
    lastCheckedRef.current = Date.now();
    try {
      await readNotified();
      const found = await checkUpdate();
      if (!found) return; // 새 버전이 없으면 아무것도 하지 않는다 (R4)
      if (isBusy(phaseRef.current)) return; // 그 사이 수동 확인·받기가 시작됐으면 맡긴다
      setPhase({ kind: "available", ...found });
      if (shouldNotify(found.version, notifiedRef.current)) {
        notify(newVersionNotice(found.version));
        rememberNotified(found.version);
      }
    } catch (e) {
      console.warn("자동 업데이트 확인 실패", e); // 조용히 다음 확인 때 다시 한다 (R9)
    }
  }, [readNotified, rememberNotified, setPhase]);

  const checkNow = useCallback(() => {
    if (isBusy(phaseRef.current)) return;
    lastCheckedRef.current = Date.now();
    setPhase({ kind: "checking" });
    void (async () => {
      try {
        await readNotified();
        const found = await checkUpdate();
        if (!found) {
          setPhase({ kind: "upToDate" });
          return;
        }
        setPhase({ kind: "available", ...found });
        // 화면에 이미 보이므로 알리지 않고 알린 버전으로만 적는다 (R14)
        if (shouldNotify(found.version, notifiedRef.current)) rememberNotified(found.version);
      } catch (e) {
        console.warn("업데이트 확인 실패", e);
        setPhase({ kind: "checkFailed" });
      }
    })();
  }, [readNotified, rememberNotified, setPhase]);

  // 5단계에서 받기·타이머 확인·설치 흐름으로 채운다
  const install = useCallback(() => {}, []);

  // 개발 모드 전용: 콘솔에서 상태를 바꿔 본다 (배포 빌드에서는 아무것도 하지 않음)
  useEffect(() => installDevUpdater(setPhase), [setPhase]);

  // 켤 때 쓸 수 있는지 보고, 쓸 수 있으면 자동 확인 타이머를 건다 (개발 모드면 걸지 않음, R5)
  useEffect(() => {
    let cancelled = false;
    let first: ReturnType<typeof setTimeout> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    void updaterInfo()
      .then((next) => {
        if (cancelled) return;
        setInfo(next);
        if (!next.available) return;
        first = setTimeout(() => void autoCheck(), FIRST_CHECK_DELAY_MS);
        poll = setInterval(() => {
          if (isCheckDue(lastCheckedRef.current, Date.now())) void autoCheck();
        }, DUE_POLL_MS);
      })
      .catch((e: unknown) => console.error("업데이트 정보 읽기 실패", e));
    return () => {
      cancelled = true;
      if (first !== undefined) clearTimeout(first);
      if (poll !== undefined) clearInterval(poll);
    };
  }, [autoCheck]);

  const store = useMemo<UpdaterStore>(() => ({ phase, info, checkNow, install }), [phase, info, checkNow, install]);
  return <UpdaterContext.Provider value={store}>{children}</UpdaterContext.Provider>;
}
