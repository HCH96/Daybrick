/**
 * 어댑터 가이드의 예시 규칙 (R30). 기본 규칙 원본 `supabase/adapters/gamejob.json`·`nexon.json`과 글자까지 같게 둔다.
 * 원본을 바꾸면 여기도 같이 바꾼다 (D30: `js_ensure_defaults()` SQL 안의 규칙도 같이).
 */

export const GAMEJOB_EXAMPLE = `{
  "format": 1,
  "name": "gamejob",
  "vars": ["dutyCode"],
  "delayMs": 1500,
  "list": {
    "url": "https://www.gamejob.co.kr/Recruit/_GI_Job_List/",
    "method": "POST",
    "headers": { "X-Requested-With": "XMLHttpRequest" },
    "body": "condition%5Bduty%5D={dutyCode}&condition%5Bmenucode%5D=duty&page={page}&direct=0&order=1&pagesize=40&tabcode=1",
    "pages": 2,
    "type": "html",
    "item": ".tblList tbody tr",
    "fields": {
      "id": { "sel": ".tit a", "attr": "href", "regex": "GI_No=(\\\\d+)" },
      "title": { "sel": ".tit a" },
      "company": { "sel": ".company strong" },
      "link": { "sel": ".tit a", "attr": "href", "base": "https://www.gamejob.co.kr" },
      "duty": { "sel": ".tit a", "attr": "onclick", "regex": "IsNullOrWhiteSpace\\\\('([^']*)'\\\\)", "optional": true }
    }
  },
  "detail": {
    "url": "https://www.gamejob.co.kr/Recruit/GI_Read_Comt_Ifrm?gno={id}",
    "type": "html",
    "body": "body",
    "images": "img"
  }
}`;

export const NEXON_EXAMPLE = `{
  "format": 1,
  "name": "nexon",
  "vars": [],
  "delayMs": 1500,
  "list": {
    "url": "https://career-gateway.nexon.com/career/v1/open/job-posts",
    "method": "POST",
    "body": {
      "corpCodes": [], "jobCategories": [], "careerTypes": [], "employmentTypes": [], "workingAreas": [],
      "query": null, "page": "{page}", "size": 15
    },
    "pages": 10,
    "type": "json",
    "item": "$.list[*]",
    "fields": {
      "id": { "sel": "jobPostNo" },
      "title": { "sel": "title" },
      "company": { "sel": "corpName" },
      "link": { "sel": "jobPostNo", "base": "https://careers.nexon.com/recruit/" },
      "body": { "sel": "contents", "optional": true }
    }
  },
  "detail": {
    "url": "https://career-gateway.nexon.com/career/v1/open/job-posts/{id}",
    "type": "json",
    "body": "$.contents",
    "images": "img"
  }
}`;
