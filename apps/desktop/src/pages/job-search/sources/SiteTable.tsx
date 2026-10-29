import { useState } from "react";
import { SmallCheckIcon, DotsIcon } from "../../../components/icons/CommonIcons";
import { NEVER_COLLECTED } from "../../../features/job-search/messages";
import type { Adapter, Site } from "../../../features/job-search/types";
import { formatDayTime } from "../profile/profileFormat";
import SiteRowMenu from "./SiteRowMenu";
import { AlertIcon } from "./SourcesIcons";

interface SiteTableProps {
  sites: Site[];
  adapters: Map<string, Adapter>;
  /** 어댑터 id → 그 어댑터를 쓰는 사이트 수 (2곳 이상이면 공유 표시, R26) */
  usage: Map<string, number>;
  /** 켜기·끄기·삭제가 진행 중인 사이트 */
  busyId: string | null;
  disabled: boolean;
  onToggle: (site: Site) => void;
  /** 자사 채용 사이트 여부 바꾸기 (R90) */
  onToggleOwn: (site: Site) => void;
  onDelete: (site: Site) => void;
}

/** 주소에서 앞의 https://·끝의 /를 뺀 짧은 글자 */
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function varsText(vars: Record<string, string>): string {
  const entries = Object.entries(vars);
  return entries.length === 0 ? "-" : entries.map(([k, v]) => `${k}=${v}`).join(", ");
}

function ResultCell({ site }: { site: Site }) {
  if (!site.enabled) return <span className="js-sources__sub">꺼짐</span>;
  const result = site.lastResult;
  if (!result) return <span className="js-sources__sub">{NEVER_COLLECTED}</span>;
  if (result.ok) {
    return (
      <span className="js-sources__chip js-sources__chip--green">
        <SmallCheckIcon size={13} />
        성공 · 공고 {result.read}개
      </span>
    );
  }
  return (
    <div className="js-sources__result">
      <span className="js-sources__chip js-sources__chip--red">
        <AlertIcon />
        실패
      </span>
      {result.reason && <span className="js-sources__sub">{result.reason}</span>}
    </div>
  );
}

/** 사이트 표 (R24, R90): 켜짐 · 사이트 · 어댑터 · 자사 · 사이트별 값 · 마지막 결과 · 마지막 수집 · ⋯ */
function SiteTable({ sites, adapters, usage, busyId, disabled, onToggle, onToggleOwn, onDelete }: SiteTableProps) {
  const [menu, setMenu] = useState<{ site: Site; anchor: HTMLElement } | null>(null);

  return (
    <div className="js-sources__panel">
      <table className="js-sources__table">
        <thead>
          <tr>
            <th>켜짐</th>
            <th>사이트</th>
            <th>어댑터</th>
            <th className="js-sources__own">자사</th>
            <th>사이트별 값</th>
            <th>마지막 결과</th>
            <th>마지막 수집</th>
            <th aria-label="메뉴" />
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => {
            const adapter = site.adapterId ? adapters.get(site.adapterId) : undefined;
            const shared = adapter ? (usage.get(adapter.id) ?? 0) >= 2 : false;
            const rowBusy = disabled || busyId === site.id;
            return (
              <tr key={site.id} className={site.enabled ? undefined : "js-sources__row--off"}>
                <td>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={site.enabled}
                    aria-label={`${site.name} 수집 ${site.enabled ? "끄기" : "켜기"}`}
                    className={`js-sources__switch${site.enabled ? " js-sources__switch--on" : ""}`}
                    disabled={rowBusy}
                    onClick={() => onToggle(site)}
                  />
                </td>
                <td className="js-sources__site">
                  <b>{site.name}</b>
                  <span className="js-sources__sub">{shortUrl(site.url)}</span>
                </td>
                <td>
                  {adapter ? (
                    <span
                      className={`js-sources__chip${shared ? " js-sources__chip--accent" : ""}`}
                      title={shared ? `사이트 ${usage.get(adapter.id)}곳이 함께 쓰는 어댑터` : undefined}
                    >
                      {adapter.name} v{adapter.version}
                    </span>
                  ) : (
                    <span className="js-sources__chip js-sources__chip--red">어댑터 없음</span>
                  )}
                </td>
                <td className="js-sources__own">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={site.ownSite}
                    aria-label={`${site.name} 자사 채용 사이트 ${site.ownSite ? "끄기" : "켜기"}`}
                    title="회사가 직접 운영하는 채용 사이트"
                    className={`js-sources__switch${site.ownSite ? " js-sources__switch--on" : ""}`}
                    disabled={rowBusy}
                    onClick={() => onToggleOwn(site)}
                  />
                </td>
                <td className="js-sources__kv">{varsText(site.vars)}</td>
                <td>
                  <ResultCell site={site} />
                </td>
                <td className="js-sources__sub">{site.lastAt ? formatDayTime(site.lastAt) : "-"}</td>
                <td>
                  <button
                    type="button"
                    className="js-sources__dots"
                    aria-label={`${site.name} 메뉴`}
                    disabled={rowBusy}
                    onClick={(e) => setMenu({ site, anchor: e.currentTarget })}
                  >
                    <DotsIcon />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {menu && (
        <SiteRowMenu
          site={menu.site}
          anchor={menu.anchor}
          onClose={() => setMenu(null)}
          onToggle={() => onToggle(menu.site)}
          onDelete={() => onDelete(menu.site)}
        />
      )}
    </div>
  );
}

export default SiteTable;
