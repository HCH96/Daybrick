import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "daybrick.sidebarCollapsed";

function readSaved(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // 저장소를 못 쓰면 펼친 상태로 시작
  }
}

/** 사이드바 접힘 상태. 앱을 다시 켜도 기억하도록 PC 안(localStorage)에 저장한다. */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(readSaved);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // 저장에 실패해도 지금 화면 동작에는 영향이 없다
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((value) => !value), []);
  return [collapsed, toggle];
}
