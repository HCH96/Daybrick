import type { ReactNode } from "react";
import { ClockIcon, GoogleIcon, KeyIcon, ServerIcon } from "../../../components/icons/ServerIcons";

interface PrepCard {
  icon: ReactNode;
  title: string;
  desc: string;
  cost: string;
}

const PREP_CARDS: PrepCard[] = [
  {
    icon: <ServerIcon />,
    title: "Supabase 프로젝트",
    desc: "데이터를 저장할 서버. 새 프로젝트를 하나 만들어 비워 두세요.",
    cost: "무료 플랜",
  },
  {
    icon: <KeyIcon />,
    title: "Anthropic API 키",
    desc: "AI 기능(공고 정리, 메일 분류)에 쓰입니다. 결제 수단 등록이 필요합니다.",
    cost: "쓴 만큼 요금",
  },
  {
    icon: <GoogleIcon />,
    title: "Google Cloud 프로젝트",
    desc: "Google 로그인을 켜는 데 필요합니다. 프로젝트만 만들어 두면 설정은 ③ 단계에서 안내합니다.",
    cost: "무료",
  },
  {
    icon: <ClockIcon />,
    title: "걸리는 시간",
    desc: "처음이면 20~30분 정도. 중간에 [취소]하면 입력한 값은 남지 않습니다.",
    cost: "한 번만 하면 됨",
  },
];

/** ① 준비: 입력 없이 준비할 계정을 카드로 보여준다 */
function PrepareStep() {
  return (
    <div className="wiz-form__inner">
      <h2>먼저 계정 세 개를 준비하세요</h2>
      <p className="wiz-form__desc">
        Daybrick은 내 서버에 내 데이터를 저장합니다. 아래 계정을 만들어 두면 다음 단계부터 값을 붙여넣기만 하면
        됩니다. 오른쪽 가이드를 순서대로 따라 하세요.
      </p>
      <div className="prep-cards">
        {PREP_CARDS.map((card) => (
          <div key={card.title} className="prep-card">
            <div className="prep-card__head">
              <span className="prep-card__icon">{card.icon}</span>
              {card.title}
            </div>
            <p>{card.desc}</p>
            <span className="prep-card__cost">{card.cost}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrepareStep;
