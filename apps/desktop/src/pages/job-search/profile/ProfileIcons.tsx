import LineIcon from "../../../components/icons/LineIcon";

/** 프로필 탭 아이콘 (목업 icons.js의 i-file·i-text·i-upload·i-alert 모양) */

export function FileIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5" />
    </LineIcon>
  );
}

export function TextIcon({ size = 16 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </LineIcon>
  );
}

export function UploadIcon() {
  return (
    <LineIcon size={20}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </LineIcon>
  );
}

export function AlertIcon() {
  return (
    <LineIcon size={16}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.01" />
    </LineIcon>
  );
}

/** 고치기: 연필 */
export function PencilIcon() {
  return (
    <LineIcon size={16}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </LineIcon>
  );
}
