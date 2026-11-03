// 타이머 카드 도트 캐릭터 (14×16 픽셀, 화면에서는 3배 42×48로 그린다).
// 좌표는 사용자 시안 Bar/Pause/Goal.dc.html(2026-11-03)에서 그대로 옮겼다. stand(서 있기)만 목업에서 새로 그렸다.
// 상의 색은 카테고리 색: 감싼 요소의 --c 값을 따른다 (style="fill:var(--c)").
// 쓰는 법: <svg class="tm-sprite" viewBox="0 0 14 16"><use href="#sp-run1"/></svg>
(function () {
  const A = 'style="fill:var(--c)"';
  const head = (eye) => `
<rect x="4" y="0" width="5" height="1" fill="#3B2A20"/><rect x="3" y="1" width="7" height="1" fill="#3B2A20"/>
<rect x="2" y="2" width="3" height="1" fill="#3B2A20"/><rect x="3" y="3" width="1" height="2" fill="#3B2A20"/>
<rect x="5" y="2" width="5" height="1" fill="#F2C9A0"/><rect x="4" y="3" width="6" height="3" fill="#F2C9A0"/>
<rect x="4" y="5" width="3" height="1" fill="#D9A97E"/>${eye}
<rect x="9" y="5" width="1" height="1" fill="#F29B8B"/><rect x="6" y="6" width="2" height="1" fill="#D9A97E"/>`;
  const shirt = `
<rect x="4" y="7" width="5" height="3" ${A}/><rect x="4" y="7" width="1" height="3" fill="#000" opacity=".25"/>
<rect x="5" y="7" width="3" height="1" fill="#fff" opacity=".3"/>`;
  const pants = `
<rect x="4" y="10" width="5" height="1" fill="#2A2B31"/><rect x="4" y="11" width="5" height="2" fill="#4B5563"/>
<rect x="4" y="11" width="1" height="2" fill="#3F4652"/>`;
  const eyeOpen = '<rect x="8" y="3" width="1" height="2" fill="#1C1D22"/>';

  const run1 = `
<rect x="3" y="8" width="1" height="2" ${A}/><rect x="3" y="8" width="1" height="2" fill="#000" opacity=".35"/>
<rect x="2" y="10" width="1" height="1" fill="#D9A97E"/><rect x="3" y="13" width="1" height="1" fill="#3F4652"/>
<rect x="2" y="14" width="1" height="1" fill="#3F4652"/><rect x="0" y="14" width="2" height="1" fill="#E5E7EB"/>
<rect x="0" y="15" width="2" height="1" fill="#8B8D94"/>${head(eyeOpen)}${shirt}${pants}
<rect x="8" y="13" width="2" height="1" fill="#4B5563"/><rect x="9" y="14" width="1" height="1" fill="#4B5563"/>
<rect x="9" y="15" width="2" height="1" fill="#E5E7EB"/><rect x="11" y="15" width="1" height="1" fill="#8B8D94"/>
<rect x="9" y="8" width="1" height="1" ${A}/><rect x="10" y="8" width="1" height="1" fill="#F2C9A0"/>
<rect x="11" y="7" width="1" height="1" fill="#F2C9A0"/>`;

  const run2 = `
<rect x="3" y="13" width="1" height="1" fill="#3F4652"/><rect x="1" y="13" width="2" height="1" fill="#E5E7EB"/>
<rect x="1" y="14" width="2" height="1" fill="#8B8D94"/>${head(eyeOpen)}${shirt}
<rect x="7" y="8" width="1" height="1" fill="#000" opacity=".25"/><rect x="8" y="9" width="2" height="1" fill="#F2C9A0"/>${pants}
<rect x="4" y="13" width="1" height="1" fill="#3F4652"/><rect x="6" y="13" width="2" height="2" fill="#4B5563"/>
<rect x="6" y="15" width="2" height="1" fill="#E5E7EB"/><rect x="8" y="15" width="1" height="1" fill="#8B8D94"/>`;

  // 앉아서 조는 모습 (눈 감음). 머리가 4칸 아래에 있다.
  const sit = `
<rect x="4" y="4" width="5" height="1" fill="#3B2A20"/><rect x="3" y="5" width="7" height="1" fill="#3B2A20"/>
<rect x="2" y="6" width="3" height="1" fill="#3B2A20"/><rect x="3" y="7" width="1" height="2" fill="#3B2A20"/>
<rect x="5" y="6" width="5" height="1" fill="#F2C9A0"/><rect x="4" y="7" width="6" height="3" fill="#F2C9A0"/>
<rect x="4" y="9" width="3" height="1" fill="#D9A97E"/><rect x="7" y="8" width="2" height="1" fill="#1C1D22"/>
<rect x="9" y="9" width="1" height="1" fill="#F29B8B"/><rect x="6" y="10" width="2" height="1" fill="#D9A97E"/>
<rect x="4" y="11" width="5" height="3" ${A}/><rect x="4" y="11" width="1" height="3" fill="#000" opacity=".25"/>
<rect x="5" y="11" width="3" height="1" fill="#fff" opacity=".3"/><rect x="9" y="12" width="1" height="1" ${A}/>
<rect x="9" y="12" width="1" height="1" fill="#000" opacity=".2"/><rect x="10" y="13" width="1" height="1" fill="#F2C9A0"/>
<rect x="4" y="14" width="8" height="1" fill="#4B5563"/><rect x="4" y="14" width="1" height="1" fill="#3F4652"/>
<rect x="4" y="15" width="4" height="1" fill="#3F4652"/><rect x="12" y="14" width="2" height="1" fill="#E5E7EB"/>
<rect x="12" y="15" width="2" height="1" fill="#8B8D94"/>`;

  // 골인: 두 팔을 들고 웃는 눈(^ ^)
  const cheer = `
<rect x="2" y="4" width="1" height="1" fill="#F2C9A0"/><rect x="2" y="5" width="1" height="2" fill="#D9A97E"/>
<rect x="3" y="7" width="1" height="1" ${A}/><rect x="3" y="7" width="1" height="1" fill="#000" opacity=".35"/>
<rect x="4" y="0" width="5" height="1" fill="#3B2A20"/><rect x="3" y="1" width="7" height="1" fill="#3B2A20"/>
<rect x="3" y="2" width="2" height="1" fill="#3B2A20"/><rect x="3" y="3" width="1" height="2" fill="#3B2A20"/>
<rect x="5" y="2" width="5" height="1" fill="#F2C9A0"/><rect x="4" y="3" width="6" height="3" fill="#F2C9A0"/>
<rect x="4" y="5" width="2" height="1" fill="#D9A97E"/><rect x="7" y="4" width="1" height="1" fill="#1C1D22"/>
<rect x="8" y="3" width="1" height="1" fill="#1C1D22"/><rect x="9" y="4" width="1" height="1" fill="#1C1D22"/>
<rect x="8" y="5" width="1" height="1" fill="#B5524A"/><rect x="6" y="5" width="1" height="1" fill="#F29B8B"/>
<rect x="6" y="6" width="2" height="1" fill="#D9A97E"/>${shirt}
<rect x="9" y="7" width="1" height="1" ${A}/><rect x="10" y="5" width="1" height="2" fill="#F2C9A0"/>
<rect x="10" y="4" width="1" height="1" fill="#F2C9A0"/>${pants}
<rect x="5" y="13" width="1" height="2" fill="#4B5563"/><rect x="7" y="13" width="1" height="2" fill="#4B5563"/>
<rect x="4" y="15" width="2" height="1" fill="#E5E7EB"/><rect x="7" y="15" width="2" height="1" fill="#E5E7EB"/>`;

  // 타이머가 없을 때: 팔을 내리고 서 있는 모습 (목업에서 새로 그림)
  const stand = `${head(eyeOpen)}${shirt}
<rect x="3" y="8" width="1" height="2" ${A}/><rect x="3" y="8" width="1" height="2" fill="#000" opacity=".35"/>
<rect x="3" y="10" width="1" height="1" fill="#D9A97E"/><rect x="9" y="8" width="1" height="2" ${A}/>
<rect x="9" y="8" width="1" height="2" fill="#000" opacity=".2"/><rect x="9" y="10" width="1" height="1" fill="#F2C9A0"/>${pants}
<rect x="5" y="13" width="1" height="2" fill="#4B5563"/><rect x="7" y="13" width="1" height="2" fill="#4B5563"/>
<rect x="4" y="15" width="2" height="1" fill="#E5E7EB"/><rect x="7" y="15" width="2" height="1" fill="#E5E7EB"/>`;

  const sym = (id, body) => `<symbol id="${id}" viewBox="0 0 14 16">${body}</symbol>`;
  document.write(`<svg xmlns="http://www.w3.org/2000/svg" style="display:none" shape-rendering="crispEdges">
${sym('sp-run1', run1)}${sym('sp-run2', run2)}${sym('sp-sit', sit)}${sym('sp-cheer', cheer)}${sym('sp-stand', stand)}
</svg>`);
})();
