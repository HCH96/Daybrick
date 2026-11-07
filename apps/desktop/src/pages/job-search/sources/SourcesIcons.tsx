import LineIcon from "../../../components/icons/LineIcon";

/** 수집 사이트 탭 아이콘 (목업 icons.js의 i-book·i-play·i-alert·i-file 모양) */

export function BookIcon() {
  return (
    <LineIcon size={16}>
      <path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />
    </LineIcon>
  );
}

export function PlayIcon() {
  return (
    <LineIcon size={16}>
      <path d="M7 4l13 8-13 8z" />
    </LineIcon>
  );
}

export function AlertIcon() {
  return (
    <LineIcon size={12}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.01" />
    </LineIcon>
  );
}

export function FileIcon() {
  return (
    <LineIcon size={16}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5" />
    </LineIcon>
  );
}

export function UploadIcon() {
  return (
    <LineIcon size={16}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </LineIcon>
  );
}
