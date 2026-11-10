// 프로젝트 목업 아이콘·그림 심볼 묶음. 화면 파일에서 <script src="icons.js"></script>로 넣고 <use href="#id"/>로 쓴다.
// i-* 선 아이콘(stroke), flag-done/flag-todo/finish 깃발, runner 캐릭터, fire-* 모닥불 6단계
document.write(`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
  <g id="flame-shape">
    <path d="M24 4C31 12 37 19 34.5 29C33 35.5 29 39.5 24 39.5S15 35.5 13.5 29C12 22 17 17 19.5 10.5C21.5 15.5 23.5 16.5 24 19C25 13.5 23 9 24 4Z" fill="#ff6a3d"/>
    <path d="M24 14C28.5 19.5 31.5 24 30 30.5C29 35 26.8 38 24 38S19 35 18.2 31C17.4 26.5 20 23 21.5 19.5C22.6 22.5 23.6 23.4 24 25C24.7 21 23.6 17.5 24 14Z" fill="#ffa23d"/>
    <path d="M24 24C26.5 27.5 27.8 30.5 27 33.5C26.4 36 25.3 37.5 24 37.5S21.4 36 21 34C20.6 31.5 22 29.5 23 27.5C23.6 29 24 29.5 24.2 30.5C24.5 28.5 23.7 26 24 24Z" fill="#ffe07a"/>
  </g>
  <g id="logs-fresh">
    <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill="#9a6a3e" transform="rotate(-13 24 40)"/>
    <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill="#7c5230" transform="rotate(13 24 40)"/>
  </g>
  <g id="logs-burnt">
    <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill="#4a3426" transform="rotate(-13 24 40)"/>
    <rect x="8" y="37" width="32" height="6.5" rx="3.2" fill="#3b2a20" transform="rotate(13 24 40)"/>
  </g>
</defs>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/></symbol>
<symbol id="i-plan" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></symbol>
<symbol id="i-bag" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5h6v2"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></symbol>
<symbol id="i-flag" viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></symbol>
<symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
<symbol id="i-fwd" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 20h4"/></symbol>
<symbol id="i-min" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="i-max" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-more" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></symbol>
<symbol id="i-grip" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></symbol>
<symbol id="i-chev-r" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
<symbol id="i-chev-d" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path d="M5 19h4L19 9l-4-4L5 15z"/></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/></symbol>

<symbol id="flag-done" viewBox="0 0 26 40"><path d="M1 0v40" stroke="#cdcdd6" stroke-width="2"/><path d="M2 2C8 0 12 5 18 3L25 2V15C19 17 13 12 7 15L2 16Z" fill="currentColor"/><path d="M8.5 8.6l2.6 2.6 5-5.4" fill="none" stroke="#17171a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="flag-todo" viewBox="0 0 26 40"><path d="M1 0v40" stroke="#6b6b78" stroke-width="2"/><path d="M2 2H11L12 17L2 15Z" fill="#2b2b31" stroke="#6b6b78" stroke-width="1.5" stroke-linejoin="round"/></symbol>
<symbol id="finish" viewBox="0 0 22 48"><path d="M2 0v48" stroke="#cdcdd6" stroke-width="2"/>
  <rect x="3" y="1" width="18" height="15" fill="#ededf2"/>
  <path d="M3 1h4.5v5H3zM12 1h4.5v5H12zM7.5 6H12v5H7.5zM16.5 6H21v5h-4.5zM3 11h4.5v5H3zM12 11h4.5v5H12z" fill="#17171a"/></symbol>
<symbol id="runner" viewBox="0 0 20 21">
  <ellipse cx="10" cy="20" rx="6" ry="1" fill="rgba(0,0,0,.45)"/>
  <path d="M8 12L5.5 16.5H2.5M12 12l2 4 3 1.5M4.5 8L1.5 10M15.5 8l3-2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="4" y="1" width="12" height="11.5" rx="3" fill="currentColor"/>
  <path d="M6 6.5h8M10 1.5v5M7.5 6.5v5.5M12.5 6.5v5.5" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
  <rect x="10" y="3.5" width="2" height="3" rx="1" fill="#17171a"/><rect x="13" y="3.5" width="2" height="3" rx="1" fill="#17171a"/>
</symbol>

<symbol id="fire-blaze" viewBox="0 0 48 48"><circle cx="24" cy="28" r="22" fill="rgba(255,130,60,.16)"/><use href="#logs-fresh"/><use href="#flame-shape"/></symbol>
<symbol id="fire-mid" viewBox="0 0 48 48"><circle cx="24" cy="32" r="16" fill="rgba(255,130,60,.12)"/><use href="#logs-fresh"/><use href="#flame-shape" transform="translate(24 40) scale(.74) translate(-24 -40)"/></symbol>
<symbol id="fire-small" viewBox="0 0 48 48"><circle cx="24" cy="36" r="11" fill="rgba(255,130,60,.10)"/><use href="#logs-fresh"/><use href="#flame-shape" transform="translate(24 40) scale(.46) translate(-24 -40)"/></symbol>
<symbol id="fire-ember" viewBox="0 0 48 48"><use href="#logs-burnt"/>
  <path d="M15 38.5h5M27 41.5h6M22 43.5h4" stroke="#ff7a3d" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="20" cy="35" r="1.2" fill="#ffa23d"/><circle cx="28" cy="33" r="1" fill="#ff6a3d"/><circle cx="24" cy="30" r=".8" fill="#ffa23d" opacity=".7"/></symbol>
<symbol id="fire-out" viewBox="0 0 48 48"><use href="#logs-burnt"/>
  <path d="M22 34c-3-3 3-5 0-8s3-5 0-8M27 33c-2.5-2.5 2.5-4 0-6.5s2.5-4 0-6.5" fill="none" stroke="#6b6b78" stroke-width="1.8" stroke-linecap="round" opacity=".8"/></symbol>
<symbol id="fire-none" viewBox="0 0 48 48"><use href="#logs-fresh" opacity=".75"/></symbol>
</svg>`);
