// js-process: 긴 공고 이미지를 위에서 아래로 나눈 PDF 쪽으로 만든다 (사용자 테스트 r1, L28).
// Anthropic은 한 변이 8,000픽셀을 넘는 이미지를 거절하고, 긴 이미지는 긴 변 1,568픽셀로 줄여 글자를 못 읽는다.
// 함수 CPU 한도(요청당 2초) 때문에 이미지를 풀지 않는다:
// - JPEG: 원본 바이트를 그대로 PDF 이미지(DCTDecode)로 넣고, 쪽마다 다른 높이를 보여 준다.
// - PNG: 투명도가 없으면 압축 데이터를 그대로(FlateDecode + PNG 예측자), 있으면 내장 압축 해제로 풀어 흰 바탕에 합친다.

/** 읽어 낸 이미지 크기와 형식 */
export type ImageInfo =
  | { kind: "jpeg"; width: number; height: number; components: number; adobe: boolean }
  | { kind: "png"; width: number; height: number; bitDepth: number; colorType: number; interlace: number }
  | { kind: "other"; width: number | null; height: number | null };

/** Anthropic이 받는 이미지 한 변의 최대 픽셀 */
export const MAX_SIDE = 8000;
/**
 * 함수 실행 한 번에 투명 PNG를 풀 수 있는 픽셀 합계 (함수 CPU 한도 2초 중 약 0.55초, 개발 PC에서 1픽셀에 약 0.14µs).
 * 이미지 한 장도 이보다 크면 풀지 않는다 (L65).
 */
export const ALPHA_RUN_PIXELS = 4_000_000;

/** 풀어서 흰 바탕에 합쳐야 하는 투명 PNG면 그 픽셀 수, 아니면 0 (pngToPdfImage가 푸는 조건과 같다) */
export function alphaPixels(info: ImageInfo): number {
  if (info.kind !== "png" || info.interlace !== 0 || info.bitDepth !== 8) return 0;
  return info.colorType === 4 || info.colorType === 6 ? info.width * info.height : 0;
}

function u16(b: Uint8Array, p: number): number {
  return (b[p] << 8) | b[p + 1];
}

function u32(b: Uint8Array, p: number): number {
  return ((b[p] << 24) >>> 0) + (b[p + 1] << 16) + (b[p + 2] << 8) + b[p + 3];
}

function ascii(b: Uint8Array, p: number, n: number): string {
  return String.fromCharCode(...b.subarray(p, p + n));
}

function jpegInfo(b: Uint8Array): ImageInfo | null {
  let p = 2;
  let adobe = false;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) {
      p++;
      continue;
    }
    const m = b[p + 1];
    if (m === 0xff) {
      p++;
      continue;
    }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
      p += 2;
      continue;
    }
    const len = u16(b, p + 2);
    if (m === 0xee && len >= 7 && ascii(b, p + 4, 5) === "Adobe") adobe = true;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (p + 10 > b.length) return null;
      return { kind: "jpeg", height: u16(b, p + 5), width: u16(b, p + 7), components: b[p + 9], adobe };
    }
    if (m === 0xda || m === 0xd9) return null;
    p += 2 + len;
  }
  return null;
}

function webpSize(b: Uint8Array): { width: number; height: number } | null {
  const chunk = ascii(b, 12, 4);
  if (chunk === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  if (chunk === "VP8 ") return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  if (chunk === "VP8L") {
    return { width: 1 + (((b[22] & 0x3f) << 8) | b[21]), height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
  }
  return null;
}

/**
 * 파일 앞부분의 형식 표시로 실제 이미지 형식(media type)을 읽는다. 모르는 형식이면 null.
 * 저장 이름의 확장자는 사이트가 알려 준 형식이라 틀릴 수 있고, Anthropic은 형식이 다르면 요청을 거절한다 (L66).
 */
export function sniffImageType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(b, 1, 3) === "PNG" && b[4] === 0x0d && b[5] === 0x0a) return "image/png";
  if (b.length >= 6 && (ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a")) return "image/gif";
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") return "image/webp";
  return null;
}

/** 머리 부분만 읽어 형식과 크기를 알아낸다 (이미지를 풀지 않는다) */
export function readImageInfo(b: Uint8Array): ImageInfo {
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    const info = jpegInfo(b);
    if (info) return info;
  }
  if (b.length > 29 && b[0] === 0x89 && ascii(b, 1, 3) === "PNG" && ascii(b, 12, 4) === "IHDR") {
    return { kind: "png", width: u32(b, 16), height: u32(b, 20), bitDepth: b[24], colorType: b[25], interlace: b[28] };
  }
  if (b.length > 10 && ascii(b, 0, 4) === "GIF8") return { kind: "other", width: b[6] | (b[7] << 8), height: b[8] | (b[9] << 8) };
  if (b.length > 30 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") {
    const size = webpSize(b);
    if (size) return { kind: "other", ...size };
  }
  return { kind: "other", width: null, height: null };
}

/** PDF 한 쪽에 보여 줄 높이: 조각이 약 115만 픽셀(Anthropic이 줄이지 않는 크기)이 되게 */
export function sliceHeight(width: number): number {
  return Math.max(400, Math.min(1568, Math.floor(1_150_000 / Math.max(1, width))));
}

/** 이미지 블록으로 그대로 보내면 거절되거나 글자를 못 읽을 만큼 긴지 */
export function needsSlicing(info: ImageInfo): boolean {
  if (info.width === null || info.height === null) return false;
  return info.width > MAX_SIDE || info.height > MAX_SIDE || info.height > sliceHeight(info.width) * 1.5;
}

/** PDF에 넣을 이미지 하나: 크기, 이미지 사전의 나머지 항목, 스트림 바이트 */
export interface PdfImage {
  width: number;
  height: number;
  dict: string;
  data: Uint8Array;
}

export function jpegToPdfImage(b: Uint8Array, info: Extract<ImageInfo, { kind: "jpeg" }>): PdfImage | null {
  const space = info.components === 1 ? "/DeviceGray" : info.components === 3 ? "/DeviceRGB" : info.components === 4 ? "/DeviceCMYK" : null;
  if (!space) return null;
  // Adobe가 저장한 CMYK JPEG는 값이 뒤집혀 있다
  const decode = info.components === 4 && info.adobe ? " /Decode [1 0 1 0 1 0 1 0]" : "";
  return { width: info.width, height: info.height, dict: `/ColorSpace ${space} /BitsPerComponent 8 /Filter /DCTDecode${decode}`, data: b };
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
}

/** PNG를 PDF 이미지로. 지원하지 않는 꼴(인터레이스, 16비트, 너무 큰 투명 PNG)이면 null */
export async function pngToPdfImage(b: Uint8Array, info: Extract<ImageInfo, { kind: "png" }>): Promise<PdfImage | null> {
  const { width, height, bitDepth, colorType } = info;
  if (info.interlace !== 0 || bitDepth === 16) return null;
  const idat: Uint8Array[] = [];
  let plte: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  for (let p = 8; p + 12 <= b.length;) {
    const len = u32(b, p);
    const type = ascii(b, p + 4, 4);
    const data = b.subarray(p + 8, p + 8 + len);
    if (type === "IDAT") idat.push(data);
    else if (type === "PLTE") plte = data;
    else if (type === "tRNS") trns = data;
    else if (type === "IEND") break;
    p += 12 + len;
  }
  if (idat.length === 0) return null;

  // 투명도 없는 꼴: 압축 데이터를 그대로 넣는다 (PDF가 PNG 예측자를 안다)
  if (colorType === 0 || colorType === 2 || colorType === 3) {
    const colors = colorType === 2 ? 3 : 1;
    let space = colorType === 2 ? "/DeviceRGB" : "/DeviceGray";
    if (colorType === 3) {
      if (!plte) return null;
      const pal = new Uint8Array(plte);
      // 팔레트 투명도는 흰 바탕에 섞어 둔다
      if (trns) {
        for (let i = 0; i < trns.length && i * 3 + 2 < pal.length; i++) {
          const al = trns[i];
          for (let k = 0; k < 3; k++) pal[i * 3 + k] = Math.round((pal[i * 3 + k] * al + 255 * (255 - al)) / 255);
        }
      }
      space = `[/Indexed /DeviceRGB ${pal.length / 3 - 1} <${hex(pal)}>]`;
    }
    return {
      width,
      height,
      dict: `/ColorSpace ${space} /BitsPerComponent ${bitDepth} /Filter /FlateDecode ` +
        `/DecodeParms << /Predictor 15 /Colors ${colors} /BitsPerComponent ${bitDepth} /Columns ${width} >>`,
      data: concat(idat),
    };
  }

  // 투명도 있는 꼴(회색+알파, RGBA): 풀어서 흰 바탕에 합친다
  if ((colorType !== 4 && colorType !== 6) || bitDepth !== 8 || width * height > ALPHA_RUN_PIXELS) return null;
  const data = await flattenAlpha(idat, width, height, colorType === 6 ? 4 : 2);
  if (!data) return null;
  return {
    width,
    height,
    dict: `/ColorSpace ${colorType === 6 ? "/DeviceRGB" : "/DeviceGray"} /BitsPerComponent 8 /Filter /FlateDecode`,
    data,
  };
}

/** 한 번에 압축기로 넘길 행 수 */
const FLAT_BLOCK_ROWS = 64;

/**
 * 투명 PNG의 IDAT를 줄 단위로 풀어 흰 바탕에 합치고 곧바로 다시 압축한다.
 * 이미지 전체를 풀어 두지 않아 메모리는 몇 줄과 압축 결과만큼만 쓴다 (풀어 두면 2,000만 픽셀에 260MB 넘게 써
 * 함수 메모리 한도를 넘었다). 데이터가 모자라거나 필터가 잘못되면 null.
 */
async function flattenAlpha(idat: Uint8Array[], width: number, height: number, bpp: number): Promise<Uint8Array | null> {
  const stride = width * bpp;
  const channels = bpp - 1;
  const flatStride = width * channels;
  // slice(): 새 ArrayBuffer로 복사 (Blob이 SharedArrayBuffer 뷰를 받지 않는 타입 규칙)
  const input = new Blob(idat.map((d) => d.slice())).stream().pipeThrough(new DecompressionStream("deflate")).getReader();
  const deflate = new CompressionStream("deflate");
  const writer = deflate.writable.getWriter();
  const output = new Response(deflate.readable).arrayBuffer();
  output.catch(() => undefined);

  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);
  const row = new Uint8Array(stride + 1);
  let block = new Uint8Array(FLAT_BLOCK_ROWS * flatStride);
  let blockRows = 0;
  let filled = 0;
  let y = 0;
  const fail = async () => {
    await input.cancel().catch(() => undefined);
    await writer.abort().catch(() => undefined);
    return null;
  };

  while (y < height) {
    const { value, done } = await input.read();
    if (done) return await fail();
    for (let at = 0; at < value.length && y < height;) {
      const take = Math.min(row.length - filled, value.length - at);
      row.set(value.subarray(at, at + take), filled);
      filled += take;
      at += take;
      if (filled < row.length) break;
      filled = 0;
      if (!unfilterRow(row, prev, cur, bpp, y > 0)) return await fail();
      const o = blockRows * flatStride;
      for (let i = 0, k = 0; i < stride; i += bpp) {
        const al = cur[i + channels];
        for (let c = 0; c < channels; c++) block[o + k++] = ((cur[i + c] * al + 255 * (255 - al) + 127) / 255) | 0;
      }
      [prev, cur] = [cur, prev];
      y++;
      blockRows++;
      if (blockRows === FLAT_BLOCK_ROWS || y === height) {
        await writer.ready;
        await writer.write(block.subarray(0, blockRows * flatStride));
        block = new Uint8Array(FLAT_BLOCK_ROWS * flatStride);
        blockRows = 0;
      }
    }
  }
  await input.cancel().catch(() => undefined);
  await writer.close();
  return new Uint8Array(await output);
}

/** PNG 한 행의 필터를 되돌린다 (`row[0]`이 필터 종류). 모르는 필터면 false */
function unfilterRow(row: Uint8Array, prev: Uint8Array, out: Uint8Array, bpp: number, hasPrev: boolean): boolean {
  const filter = row[0];
  if (filter > 4) return false;
  const stride = out.length;
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? out[x - bpp] : 0;
    const b = hasPrev ? prev[x] : 0;
    const c = x >= bpp && hasPrev ? prev[x - bpp] : 0;
    const v = row[x + 1];
    let r: number;
    if (filter === 0) r = v;
    else if (filter === 1) r = v + a;
    else if (filter === 2) r = v + b;
    else if (filter === 3) r = v + ((a + b) >> 1);
    else {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
    out[x] = r & 0xff;
  }
  return true;
}

/**
 * 이미지들을 순서대로 PDF로 만든다. 이미지마다 sliceHeight 높이로 나눠 한 쪽씩 둔다 (1포인트 = 1픽셀).
 * 쪽이 maxPages를 넘으면 뒤쪽은 버린다. 만든 쪽 수도 돌려준다.
 */
export function buildPdf(images: PdfImage[], maxPages: number): { pdf: Uint8Array; pages: number } {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (chunk: Uint8Array | string) => {
    const bytes = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    size += bytes.length;
  };

  // 쪽 계획: [이미지 번호, 위에서부터의 위치, 쪽 높이]
  const plan: [number, number, number][] = [];
  images.forEach((img, i) => {
    const step = sliceHeight(img.width);
    for (let top = 0; top < img.height && plan.length < maxPages; top += step) {
      plan.push([i, top, Math.min(step, img.height - top)]);
    }
  });

  // 번호: 1 카탈로그, 2 쪽 묶음, 3.. 이미지, 그 뒤 쪽마다 (쪽, 내용)
  const imageId = (i: number) => 3 + i;
  const pageId = (k: number) => 3 + images.length + k * 2;
  const total = 2 + images.length + plan.length * 2;
  const obj = (id: number, body: string | Uint8Array[]) => {
    offsets[id] = size;
    push(`${id} 0 obj\n`);
    if (typeof body === "string") push(body);
    else body.forEach(push);
    push("\nendobj\n");
  };

  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])); // %PDF-1.4 + 이진 표시
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  const kids = plan.map((_, k) => `${pageId(k)} 0 R`).join(" ");
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${plan.length} >>`);
  images.forEach((img, i) => {
    obj(imageId(i), [
      enc.encode(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} ${img.dict} /Length ${img.data.length} >>\nstream\n`),
      img.data,
      enc.encode("\nendstream"),
    ]);
  });
  plan.forEach(([i, top, h], k) => {
    const img = images[i];
    const content = `q ${img.width} 0 0 ${img.height} 0 ${h + top - img.height} cm /Im${i} Do Q`;
    obj(pageId(k), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${img.width} ${h}] ` +
      `/Resources << /XObject << /Im${i} ${imageId(i)} 0 R >> >> /Contents ${pageId(k) + 1} 0 R >>`);
    obj(pageId(k) + 1, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  const xref = size;
  let table = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= total; id++) table += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  push(table);
  push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return { pdf: concat(parts), pages: plan.length };
}
