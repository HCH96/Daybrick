// 목업 아이콘 모음. <svg><use href="#i-..."></svg> 로 쓰는 심볼을 페이지에 넣는다.
// AI는 보통 읽지 않는다. 아이콘 모양이 필요하면 id(예: i-home)를 검색한다.
document.write(`
<svg width="0" height="0" style="position:absolute">
  <symbol id="i-side" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" /></symbol>
  <symbol id="i-fwd" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></symbol>
  <symbol id="i-timer" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" /><path d="M12 9v4M10 2h4" /></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
  <symbol id="i-bricks" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9.33h18M3 14.67h18M12 4v5.33M7.5 9.33v5.34M16.5 9.33v5.34M12 14.67V20" /></symbol>
  <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6a6 6 0 0 1-7.5 1.2L6 21.3a2 2 0 0 1-2.8-2.8l7.5-7.5A6 6 0 0 1 11.4 3l1.3 1.3a4 4 0 0 0 2 2z" /></symbol>
  <!-- 홈 개편(L34): 지금 메뉴 아이콘(n-), 깃발(f-), 타이머 버튼(t-), 전형 종류(k-) -->
  <symbol id="n-home" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-5h4v5" /></symbol>
  <symbol id="n-plan" viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9" /></symbol>
  <symbol id="n-flag" viewBox="0 0 24 24"><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></symbol>
  <symbol id="n-cal" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /><path d="M8 14h2M14 14h2M8 17h2" /></symbol>
  <symbol id="n-bag" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5h6v2" /></symbol>
  <symbol id="n-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></symbol>
  <symbol id="n-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></symbol>
  <symbol id="n-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></symbol>
  <symbol id="n-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" /><path d="M10 20h4" /></symbol>
  <symbol id="f-todo" viewBox="0 0 12 14"><path d="M1.5 0.5v13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M2.2 1.3h8l-1.6 2.6 1.6 2.6h-8z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></symbol>
  <symbol id="t-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none" /></symbol>
  <symbol id="t-pause" viewBox="0 0 24 24"><path d="M9 5v14M15 5v14" /></symbol>
  <symbol id="t-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
  <symbol id="t-stop" viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" /></symbol>
  <symbol id="k-int" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></symbol>
  <symbol id="k-code" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></symbol>
  <symbol id="k-doc" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z" /><path d="M9 12h6M9 16h4" /></symbol>
  <symbol id="k-warn" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></symbol>
</svg>
`);
