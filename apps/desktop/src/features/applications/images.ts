import { convertFileSrc, invoke, isTauri } from "@tauri-apps/api/core";
import { appDataDir, sep } from "@tauri-apps/api/path";

/**
 * 본문 이미지 (R35).
 * 본문(마크다운)에는 `images/파일명` 상대 경로만 적고, 화면에 그릴 때 asset 주소로 바꾼다.
 * 앱 데이터 폴더가 바뀌어도 본문을 고칠 필요가 없게 하기 위해서다.
 */

const IMAGE_PREFIX = "images/";

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

let baseDir: string | null = null;

/** 앱 데이터 폴더 경로를 한 번만 읽어 둔다. 편집기를 그리기 전에 끝나 있어야 한다. */
export async function loadImageBaseDir(): Promise<void> {
  if (!isTauri() || baseDir !== null) return;
  baseDir = await appDataDir();
}

export function isImageBaseReady(): boolean {
  return !isTauri() || baseDir !== null;
}

/** 본문에 적힌 경로 → `<img src>`에 넣을 주소. `images/`로 시작하지 않으면 그대로 둔다. */
export function resolveImageSrc(src: string): string {
  if (baseDir === null || !src.startsWith(IMAGE_PREFIX)) return src;
  const s = sep();
  return convertFileSrc(baseDir + s + src.split("/").join(s));
}

export function isSupportedImage(file: File): boolean {
  return file.type in EXT_BY_MIME;
}

/**
 * 이미지 파일을 `images/`에 저장하고 본문에 넣을 경로를 돌려준다.
 * 브라우저 미리보기(Tauri 밖)에서는 저장하지 않고 임시 blob 주소를 돌려준다.
 */
export async function saveImage(file: File): Promise<string> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) throw new Error(`지원하지 않는 이미지 형식: ${file.type}`);
  if (!isTauri()) return URL.createObjectURL(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  return invoke<string>("save_image", bytes, { headers: { "x-image-ext": ext } });
}
