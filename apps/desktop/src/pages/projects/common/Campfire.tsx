import type { Fire } from "../../../features/projects/campfire";
import { FireArt } from "./ProjectIcons";

const FIRE_LABEL: Record<Fire, string> = {
  blaze: "활활 타는 불",
  mid: "보통 불",
  small: "작은 불",
  ember: "잉걸불",
  out: "꺼진 불",
  wood: "장작만",
};

interface CampfireProps {
  fire: Fire;
  /** 카드 26, 잔디 옆 연속 작업 40, 진행 판 60 (목업 .fire.sm / .streak .fire / .fire) */
  size?: 26 | 40 | 60;
}

/** 모닥불 그림 (프로젝트 R27, visual.md 모닥불 단계) */
function Campfire({ fire, size = 26 }: CampfireProps) {
  return (
    <span className="proj-fire" style={{ width: size, height: size }} role="img" aria-label={FIRE_LABEL[fire]}>
      <FireArt fire={fire} />
    </span>
  );
}

export default Campfire;
