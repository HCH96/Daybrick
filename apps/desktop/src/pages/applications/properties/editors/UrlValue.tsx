import type { KeyboardEvent } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLinkIcon } from "../../../../components/icons/CommonIcons";
import type { PropertyValue } from "../../../../features/applications/types";

interface UrlValueProps {
  value: string;
  label: string;
  onChange: (value: PropertyValue) => void;
}

/** "careers.nexon.com/..."처럼 앞부분을 빼고 써도 열 수 있게 https://를 붙인다 */
function toHref(text: string): string {
  const trimmed = text.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function openInBrowser(text: string) {
  const href = toHref(text);
  if (isTauri()) {
    openUrl(href).catch((e: unknown) => console.error("링크 열기 실패", e));
  } else {
    window.open(href, "_blank", "noopener");
  }
}

/** URL 값: 칸에서 바로 고치고, 오른쪽 버튼으로 기본 브라우저에서 연다 */
function UrlValue({ value, label, onChange }: UrlValueProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
  };

  return (
    <span className="prop-url">
      <input
        className="prop-input prop-input--url"
        type="text"
        value={value}
        placeholder="비어 있음"
        spellCheck={false}
        aria-label={label}
        onChange={(e) => {
          const text = e.target.value.trim();
          onChange(text === "" ? null : e.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      {value.trim() !== "" && (
        <button
          type="button"
          className="prop-url__open"
          title="브라우저에서 열기"
          aria-label="브라우저에서 열기"
          onClick={() => openInBrowser(value)}
        >
          <ExternalLinkIcon />
        </button>
      )}
    </span>
  );
}

export default UrlValue;
