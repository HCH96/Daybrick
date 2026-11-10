import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadAppSettings } from "../background/api";
import { runQuitHandlers } from "../../app/quit";
import { notify } from "../notifications/notify";
import { useToday } from "../today/store";
import {
  checkUpdate,
  markUpdateNotified,
  realBackend,
  toUpdateError,
  updaterInfo,
  type FoundUpdate,
  type UpdateBackend,
  type UpdaterInfo,
} from "./api";
import { installDevUpdater } from "./devUpdater";
import { isCheckDue, progressPercent, shouldNotify } from "./logic";
import { failureNotice, newVersionNotice } from "./notices";

/** 첫 자동 확인은 화면이 뜨고 이만큼 뒤 (R1, D4) */
const FIRST_CHECK_DELAY_MS = 5_000;
/** 그 뒤 이 간격마다 24시간이 지났는지만 본다 (R2, D4) */
const DUE_POLL_MS = 60 * 60 * 1000;

/**
 * 업데이트 상태 (structure.md 3절). 실패 뒤에도 찾은 버전 정보는 남겨 버튼을 다시 누를 수 있다.
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

/** 지금 떠 있는 창: 타이머 확인 (R17, R20) */
export type UpdaterDialog = "timer-confirm" | null;

export interface UpdaterStore {
  phase: UpdaterPhase;
  /** 지금 버전과 쓸 수 있는지. 읽기 전이면 null */
  info: UpdaterInfo | null;
  /** [업데이트 확인] 수동 확인 (R14) */
  checkNow: () => void;
  /** [설치하고 다시 시작] (R16) */
  install: () => void;
  dialog: UpdaterDialog;
  /** 타이머 확인 [기록 저장하고 설치] (R18) */
  confirmTimer: () => void;
  /** 타이머 확인 [나중에 설치]·Esc (R19) */
  postponeInstall: () => void;
}

const UpdaterContext = createContext<UpdaterStore | null>(null);

/** 업데이트 상태. UpdaterProvider 밖이면 null */
export function useUpdater(): UpdaterStore | null {
  return useContext(UpdaterContext);
}

/** 찾은 새 버전 정보. 없는 상태면 null */
function foundOf(phase: UpdaterPhase): FoundUpdate | null {
  return "version" in phase ? { version: phase.version, notes: phase.notes } : null;
}

function isBusy(phase: UpdaterPhase): boolean {
  return phase.kind === "checking" || phase.kind === "downloading" || phase.kind === "installing";
}

/**
 * 새 버전 자동 확인과 알림 (자동 업데이트 R1, R2, R4–R9, R14, D3, D4). 화면은 없다.
 * - 켤 때 쓸 수 있으면(설치본) 5초 뒤 한 번, 그 뒤 1시간마다 24시간이 지났으면 확인한다.
 * - 자동 확인으로 찾은 버전은 한 번만 알린다. 실패는 콘솔에만 남기고 상태를 바꾸지 않는다 (R9).
 * - 수동 확인은 결과를 상태로 보이고, 찾은 버전은 알리지 않고 알린 버전으로만 적는다 (R14).
 * - 설치: 타이머가 돌면 묻고(R17) → 받기(진행률, R20) → 설치 직전 타이머를 다시 보고 → 종료 전 저장 → 설치 (R21, D2).
 *   [기록 저장하고 설치]는 트레이 종료와 같이 종료 전 저장(투데이 D9)으로 기록을 남긴다 (R18).
 */
export function UpdaterProvider({ children }: { children?: ReactNode }) {
  const [info, setInfo] = useState<UpdaterInfo | null>(null);
  const [phase, setPhaseState] = useState<UpdaterPhase>({ kind: "idle" });
  // 타이머 처리기는 한 번만 등록하므로 최신 값은 ref로 읽는다
  const phaseRef = useRef<UpdaterPhase>(phase);
  const lastCheckedRef = useRef<number | null>(null);
  const notifiedRef = useRef<string | null>(null);
  const settingsReadRef = useRef<Promise<void> | null>(null);

  const { state: today } = useToday();
  const hasTimerRef = useRef(false);
  hasTimerRef.current = today.kind === "ready" && today.data.running !== null;
  const [dialog, setDialog] = useState<UpdaterDialog>(null);
  /** 이번 설치 흐름에서 [기록 저장하고 설치]를 골랐는지 (R20: 받는 사이 타이머를 켰으면 다시 묻기) */
  const consentRef = useRef(false);
  /** 확인 창 뒤에 이어 할 일: 받기 전(R17) / 설치 직전(R20) */
  const askStepRef = useRef<"download" | "install">("download");
  const backendRef = useRef<UpdateBackend>(realBackend);

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

  /** 받기·설치 실패: 상태 문구와 주의 알림 (R22, R23). 찾은 버전은 남겨 다시 누를 수 있게 한다 */
  const fail = useCallback(
    (found: FoundUpdate, e: unknown) => {
      const error = toUpdateError(e);
      console.warn("업데이트 받기·설치 실패", error);
      setPhase({ kind: error.kind === "signature" ? "signatureFailed" : "downloadFailed", ...found });
      notify(failureNotice(error.kind));
    },
    [setPhase],
  );

  /** 종료 전 저장(최대 5초, background D3·D4)을 마치고 설치한다. 설치 실패는 받기 실패와 같다 (R21) */
  const finishInstall = useCallback(
    async (found: FoundUpdate) => {
      setPhase({ kind: "installing", ...found });
      await runQuitHandlers();
      try {
        await backendRef.current.install();
      } catch (e) {
        fail(found, e);
      }
    },
    [fail, setPhase],
  );

  /** 받은 뒤: 타이머가 돌고 이번 흐름에서 동의하지 않았으면 한 번 더 묻는다 (R20) */
  const afterDownload = useCallback(
    (found: FoundUpdate) => {
      if (hasTimerRef.current && !consentRef.current) {
        askStepRef.current = "install";
        setDialog("timer-confirm");
        return;
      }
      void finishInstall(found);
    },
    [finishInstall],
  );

  const startDownload = useCallback(
    async (found: FoundUpdate) => {
      setPhase({ kind: "downloading", percent: null, ...found });
      try {
        await backendRef.current.download((p) => {
          if (phaseRef.current.kind !== "downloading") return;
          setPhase({ kind: "downloading", percent: progressPercent(p.downloaded, p.total), ...found });
        });
      } catch (e) {
        fail(found, e);
        return;
      }
      afterDownload(found);
    },
    [afterDownload, fail, setPhase],
  );

  const install = useCallback(() => {
    const found = foundOf(phaseRef.current);
    if (!found || isBusy(phaseRef.current)) return;
    consentRef.current = false;
    if (hasTimerRef.current) {
      askStepRef.current = "download";
      setDialog("timer-confirm"); // R17
      return;
    }
    void startDownload(found); // R16
  }, [startDownload]);

  const confirmTimer = useCallback(() => {
    setDialog(null);
    const found = foundOf(phaseRef.current);
    if (!found) return;
    consentRef.current = true; // 이번 흐름에서는 다시 묻지 않는다 (R18)
    if (askStepRef.current === "install") void finishInstall(found);
    else void startDownload(found);
  }, [finishInstall, startDownload]);

  const postponeInstall = useCallback(() => {
    setDialog(null);
    const found = foundOf(phaseRef.current);
    if (!found) return;
    // 받아 둔 것은 버리고 새 버전 정보·버튼만 남긴다 (R19, D2)
    if (askStepRef.current === "install") {
      void backendRef.current.discard().catch((e: unknown) => console.error("받은 업데이트 버리기 실패", e));
    }
    setPhase({ kind: "available", ...found });
  }, [setPhase]);

  // 개발 모드 전용: 콘솔에서 상태를 바꾸고 받기·설치를 흉내 낸다 (배포 빌드에서는 아무것도 하지 않음)
  useEffect(
    () =>
      installDevUpdater({
        setPhase,
        install,
        setBackend: (next) => {
          backendRef.current = next ?? realBackend;
        },
      }),
    [setPhase, install],
  );

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

  const store = useMemo<UpdaterStore>(
    () => ({ phase, info, checkNow, install, dialog, confirmTimer, postponeInstall }),
    [phase, info, checkNow, install, dialog, confirmTimer, postponeInstall],
  );
  return <UpdaterContext.Provider value={store}>{children}</UpdaterContext.Provider>;
}
