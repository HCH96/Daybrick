import { isTauri } from "@tauri-apps/api/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installFileDropGuard } from "./app/fileDropGuard";
import "./styles/theme.css";
import "./styles/base.css";

installFileDropGuard();

async function start(): Promise<void> {
  // 브라우저 미리보기(개발 모드)에서만 `?fixture=` 예시 데이터를 넣는다. 출시 빌드에서는 이 분기가 빠진다.
  if (import.meta.env.DEV && !isTauri()) {
    const { applyFixtureFromUrl } = await import("./dev/fixtures");
    applyFixtureFromUrl();
  }
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void start();
