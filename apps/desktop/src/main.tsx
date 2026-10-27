import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installFileDropGuard } from "./app/fileDropGuard";
import "./styles/theme.css";
import "./styles/base.css";

installFileDropGuard();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
