# 배포 설정·릴리즈 (req-release)

## A2 tauri.conf 업데이트 설정
- 테스트 내용: 업데이트 주소·업데이트 파일 만들기·공개키·버전 칸·식별자
- 근거 요구사항: R3, R25, R27, R34
- 수행 방법: node로 apps/desktop/src-tauri/tauri.conf.json을 읽고, `C:\Users\sjrnf\.tauri\daybrick.key.pub`(공개키)를 읽어 `plugins.updater.pubkey`와 앞뒤 공백을 뺀 문자열로 비교
- 예상 결과: endpoints가 `https://github.com/HCH96/Daybrick/releases/latest/download/latest.json` 하나, `bundle.createUpdaterArtifacts: true`, pubkey 일치, 최상위 `version` 없음, 식별자 `com.daybrick.desktop`
- 실제 결과: endpoints 배열에 그 주소 하나, createUpdaterArtifacts true, pubkey 일치(true), 최상위 version 칸 없음, identifier `com.daybrick.desktop`
- 판정: 통과

## A3 버전 일치
- 테스트 내용: 다섯 곳의 앱 버전이 같고 x.y.z 모양인지
- 근거 요구사항: R25, R26
- 수행 방법: `grep '^version' src-tauri/Cargo.toml`, Cargo.lock의 `name = "daybrick"` 다음 줄, node로 package.json `version`, package-lock.json `version`과 `packages[""].version`
- 예상 결과: 모두 0.2.1
- 실제 결과: Cargo.toml 0.2.1, Cargo.lock(daybrick) 0.2.1, package.json 0.2.1, package-lock.json 두 곳 0.2.1
- 판정: 통과

## A4 서명 키 파일이 저장소에 없음
- 테스트 내용: 키 파일이 추적되지 않고 .gitignore가 막는지
- 근거 요구사항: R28
- 수행 방법: `git ls-files | grep -E '\.key(\.pub)?$'`, `grep key .gitignore` (비밀키 파일은 읽지 않음)
- 예상 결과: 추적되는 *.key·*.key.pub 없음, .gitignore에 `*.key`
- 실제 결과: 결과 없음, 루트 .gitignore 5줄째 `*.key`
- 판정: 통과

## A16 v0.2.1 릴리즈
- 테스트 내용: 릴리즈가 Latest이고 파일 세 개와 latest.json 모양이 맞는지
- 근거 요구사항: R30, R31
- 수행 방법: `gh release view v0.2.1 --repo HCH96/Daybrick --json tagName,isDraft,isPrerelease,assets`, `gh api repos/HCH96/Daybrick/releases/latest --jq .tag_name`, latest.json을 임시 폴더로 받아 node로 칸 확인 (서명은 base64를 풀어 첫 줄만 봄)
- 예상 결과: Latest, 파일 세 개(setup.exe, .exe.sig, latest.json), version·url·signature 모양 맞음
- 실제 결과: 초안·사전 릴리즈 아님, latest 릴리즈 태그 v0.2.1. 파일 `Daybrick_0.2.1_x64-setup.exe`, `Daybrick_0.2.1_x64-setup.exe.sig`, `latest.json`. latest.json: version `0.2.1`, platforms `windows-x86_64` 하나, url `https://github.com/HCH96/Daybrick/releases/download/v0.2.1/Daybrick_0.2.1_x64-setup.exe`, signature는 base64 문자열(436자)이고 풀면 "untrusted comment: signature from tauri secret key"로 시작
- 판정: 통과
