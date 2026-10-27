import { INJECTION_BODY, INJECTION_SCORED_BODY, INJECTION_TITLE } from "../../../features/job-search/messages";
import { BigAlertIcon } from "./PopupIcons";

interface InjectionAlertProps {
  /** 의심 문장 원문 또는 규칙 검사 설명 (D36 `suspect_quotes`) */
  quotes: string[];
  /** 그래도 채점으로 이미 채점했으면 true (경고줄은 계속 보인다) */
  scored: boolean;
}

/** 팝업 맨 위 빨간 경고줄과 의심 문장 인용 (R13, R49) */
function InjectionAlert({ quotes, scored }: InjectionAlertProps) {
  return (
    <div className="js-popup__warn" role="alert">
      <BigAlertIcon />
      <div>
        <b>{INJECTION_TITLE}</b>
        {scored ? INJECTION_SCORED_BODY : INJECTION_BODY}
        {quotes.map((q, i) => (
          <q key={i}>{q}</q>
        ))}
      </div>
    </div>
  );
}

export default InjectionAlert;
