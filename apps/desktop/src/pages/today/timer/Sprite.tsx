import { SPRITES, type SpriteName } from "./sprites";

/** 도트 캐릭터 한 장 (14×16 그리드를 42×48로, crispEdges). 상의 색은 감싼 요소의 `--c`. */
function Sprite({ name, className }: { name: SpriteName; className?: string }) {
  return (
    <svg
      className={className ? `track-scene__sprite ${className}` : "track-scene__sprite"}
      viewBox="0 0 14 16"
      width={42}
      height={48}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {SPRITES[name].map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} style={{ fill: r.fill }} opacity={r.opacity} />
      ))}
    </svg>
  );
}

export default Sprite;
