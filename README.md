# Blog

Astro 기반으로 제작한 개인 블로그이자 포트폴리오 프로젝트입니다. 콘텐츠 중심의 구조를 유지하면서도, 검색성과 확장성을 함께 고려해 설계했습니다.

## 기술 스택

- Astro 5
- Tailwind CSS 4
- Preact (섬 아키텍처 인터랙션)
- Pagefind (클라이언트 검색)
- Shiki (코드 하이라이트)

## 주요 특징

- 블로그, 포트폴리오, 소개 페이지를 하나의 콘텐츠 구조 안에서 일관되게 관리
- Astro Content Collections 기반 스키마 검증으로 콘텐츠 작성 안정성 확보
- Preact 아일랜드 아키텍처로 검색, 테마 토글, 코드 복사 등 인터랙션 처리
- Pagefind를 이용한 정적 검색 지원 (검색 결과에 요약 표시)
- Shiki 기반 코드 하이라이팅 적용
- 사이트 설정, 콘텐츠 스키마, UI 레이어를 분리해 유지보수성과 확장성 강화

## 폴더 구조

```text
src/
  assets/
  components/
  content/
    about/
    blog/
    portfolio/
  layouts/
  pages/
  styles/
  utils/
```

각 디렉터리는 다음과 같은 역할을 담당합니다.

- `assets/`: 이미지, 아이콘 등 정적 에셋 관리
- `components/`: 재사용 가능한 UI 컴포넌트 관리
- `content/`: 블로그, 포트폴리오, 소개 콘텐츠 원본 관리
- `layouts/`: 페이지 공통 레이아웃 정의
- `pages/`: 라우팅 기준이 되는 페이지 엔트리 관리
- `styles/`: 전역 스타일 및 스타일 시스템 구성
- `utils/`: 날짜 포맷, 정렬, 필터링 등 공통 유틸리티 관리

## 실행 명령어

프로젝트 루트에서 실행합니다.

- `pnpm install`: 의존성 설치
- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드 생성
- `pnpm preview`: 빌드 결과 로컬 미리보기

## 콘텐츠 작성 규칙

콘텐츠 스키마는 `src/content.config.ts`를 기준으로 관리합니다.

### Blog (`src/content/blog/*.md`)

```yaml
title: string
description: string
pubDate: date
tags: string[]
ogImage: image (optional)
draft: boolean (default: false)
```

### Portfolio (`src/content/portfolio/*.md`)

```yaml
title: string
description: string
pubDate: date
startDate: date (optional)
endDate: date (optional)
techStack: string[]
coverImage: image (optional)
links:
  github: url (optional)
  live: url (optional)
draft: boolean (default: false)
```

- `startDate`가 있으면 프로젝트 기간을 "2026년 3월 — 2026년 3월" 형태로 표시합니다.
- `endDate`를 생략하면 "진행 중"으로 표시됩니다.
- 포트폴리오 목록은 `startDate` 기준 최신순으로 정렬됩니다 (`startDate` 없으면 `pubDate` 사용).

### About (`src/content/about/index.md`)

```yaml
title: string
description: string
```

## 검색 (Pagefind)

- 검색 UI는 `SearchDialog`에서 lazy-load 됩니다.
- 기본 인덱스는 `pnpm build` 시 생성됩니다.
- 인덱싱 가능한 콘텐츠가 없을 경우 Pagefind가 실패할 수 있어, 현재 빌드 스크립트에서는 해당 상황을 안전하게 처리하도록 구성했습니다.
- 검색 대상에서 제외할 요소는 `pagefind_ignore` 속성을 통해 제어할 수 있습니다.

## 환경 설정

- 사이트 기본 설정: `src/config.ts`
- `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` 등 프로젝트 전반에서 공통으로 참조되는 값을 별도 파일로 분리해 일관성 있게 관리합니다.
- 배포 환경이 변경되더라도 한 곳만 수정하면 전체에 반영되도록 설계했습니다.
