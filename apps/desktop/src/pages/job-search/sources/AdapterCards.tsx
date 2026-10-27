import { NO_ADAPTERS } from "../../../features/job-search/messages";
import type { Adapter, Site } from "../../../features/job-search/types";
import { FileIcon } from "./SourcesIcons";

interface AdapterCardsProps {
  adapters: Adapter[];
  sites: Site[];
  /** 어댑터 id → 그 어댑터를 쓰는 사이트 수 */
  usage: Map<string, number>;
}

function usageText(count: number): string {
  if (count === 0) return "쓰는 사이트 없음";
  if (count === 1) return "사이트 1곳";
  return `사이트 ${count}곳이 함께 씀`;
}

/** 켜진 사이트 중 이 어댑터를 쓰는 곳의 마지막 수집이 실패했으면 true */
function lastFailed(adapter: Adapter, sites: Site[]): boolean {
  return sites.some((s) => s.enabled && s.adapterId === adapter.id && s.lastResult !== null && !s.lastResult.ok);
}

/** 어댑터 카드 4열 (R25–R27): 이름·버전·기본 여부, 함께 쓰는 사이트 수, 마지막 수집 실패 칩 */
function AdapterCards({ adapters, sites, usage }: AdapterCardsProps) {
  return (
    <section className="js-sources__adapters">
      <h3 className="js-sources__title">
        <FileIcon />
        어댑터
        <span className="js-sources__sub">규칙 파일(JSON) · 서버 공용 수집 함수가 읽어서 실행</span>
      </h3>
      {adapters.length === 0 ? (
        <p className="js-sources__empty">{NO_ADAPTERS}</p>
      ) : (
        <div className="js-sources__ad-list">
          {adapters.map((adapter) => (
            <div key={adapter.id} className="js-sources__ad">
              <div className="js-sources__ad-top">
                <b>{adapter.name}</b>
                <span className="js-sources__chip">v{adapter.version}</span>
                {adapter.builtin && <span className="js-sources__chip js-sources__chip--blue">기본</span>}
                {lastFailed(adapter, sites) && (
                  <span className="js-sources__chip js-sources__chip--red">마지막 수집 실패</span>
                )}
              </div>
              <span className="js-sources__sub">{usageText(usage.get(adapter.id) ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdapterCards;
