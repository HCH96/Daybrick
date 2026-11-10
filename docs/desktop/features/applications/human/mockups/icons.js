// 목업 아이콘 모음. <svg><use href="#i-..."></svg> 로 쓰는 심볼을 페이지에 넣는다.
// AI는 보통 읽지 않는다. 아이콘 모양이 필요하면 id(예: i-home)를 검색한다.
document.write(`
<svg width="0" height="0" style="position:absolute">
  <defs>
    <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></symbol>
    <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></symbol>
    <symbol id="i-timer" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" /><path d="M12 9v4M10 2h4" /></symbol>
    <symbol id="i-side" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></symbol>
    <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" /></symbol>
    <symbol id="i-fwd" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
    <symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
    <symbol id="i-left" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></symbol>
    <symbol id="i-right" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></symbol>
    <symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
    <symbol id="i-max" viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></symbol>
    <symbol id="i-min" viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7" /></symbol>
    <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></symbol>
    <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></symbol>
    <symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-4h4v4" /></symbol>
    <symbol id="i-sort" viewBox="0 0 24 24"><path d="M7 4v16M3 16l4 4 4-4M14 6h7M14 12h5M14 18h3" /></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" /></symbol>
    <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z" /><path d="M9.5 13.5l2 2 3.5-3.5" /></symbol>
    <!-- 속성 종류 아이콘 -->
    <symbol id="t-text" viewBox="0 0 24 24"><path d="M5 6h14M12 6v13M9 19h6" /></symbol>
    <symbol id="t-num" viewBox="0 0 24 24"><path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" /></symbol>
    <symbol id="t-select" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M8 11l4 4 4-4" /></symbol>
    <symbol id="t-multi" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></symbol>
    <symbol id="t-date" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></symbol>
    <symbol id="t-url" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></symbol>
    <symbol id="t-checkbox" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></symbol>
    <symbol id="t-flag" viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></symbol>
  </defs>
</svg>
`);
