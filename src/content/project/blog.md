---
title: Blog
description: 개인 기술 블로그 및 포트폴리오 사이트
pubDate: 2026-03-13
startDate: 2026-02-19
endDate: 2026-03-10
techStack:
  - Astro
  - TypeScript
  - Tailwind CSS
  - Preact
  - Pagefind
  - Shiki
coverImage: "../../assets/project/blog.png"
links:
  github: "https://github.com/sageherb/blog"
  live: "https://sageherb.dev/"
draft: true
---

## 개요

개인 기술 블로그 및 포트폴리오 사이트

`Astro`를 기반으로 블로그, 포트폴리오, 검색, 코드 하이라이팅, SEO, Open Graph 이미지까지 직접 관리할 수 있는 구조로 구성했습니다.

- `Astro`의 `Islands Architecture`와 `SSG` 기반 정적 블로그 구현
- `Content Collections`을 이용해 블로그 글과 포트폴리오 콘텐츠 구조 관리
- `Pagefind`를 이용해 서버 없이 동작하는 정적 검색 기능 구현
- `Tailwind CSS Typography` 기반 마크다운 스타일링
- `Shiki`를 이용한 코드 하이라이팅 구현
- 쿨 그린 계열 포인트 컬러와 `zinc` 기반 디자인 시스템 정리
- 페이지별 `meta`, `canonical`, `Open Graph`, `JSON-LD` 설정
- `Satori` 기반 동적 OG Image 생성
- `Vercel` 배포 및 커스텀 도메인 연결

## Astro를 선택한 이유

`Velog`나 `Medium` 같은 플랫폼을 사용하면 편하고 빠르게 이용할 수 있지만, 구조와 디자인, SEO 등을 직접 제어하기 어렵습니다. 직접 블로그를 만들면 기술 선택과 설계를 스스로 결정할 수 있고 블로그 자체도 하나의 포트폴리오 프로젝트로 보여줄 수 있다고 판단했습니다.

기존에 사용해본 `React`나 `Next.js`를 사용하는 것도 가능했지만, 개인 기술 블로그는 대부분 정적 콘텐츠로 구성됩니다. `CSR`인 `React`는 SEO에 불리해 적합하지 않다고 생각했고, `SSR`은 서버에 부담이 됩니다. 그래서 블로그 글을 `md` 파일로 관리하고, 콘텐츠가 추가될 때 빌드하여 배포할 수 있는 `SSG` 방식이 가장 적합하다 생각했습니다.

여러 기술 중 가볍고 빠르고 필요한 부분에만 인터랙션을 줄 수 있는 `Islands Architecture`가 있는 `Astro`가 마음에 들어 선택했습니다.

## Pagefind를 선택한 이유

SSG인 블로그에서 검색 기능을 위해 별도의 서버나 데이터베이스를 두는 것은 과하다고 판단했습니다. `Pagefind`는 빌드 시점에 인덱스를 생성하는 정적 검색 라이브러리이기 때문에 블로그와 가장 적합해 선택하게 되었습니다.

처음 블로그를 개발할 땐 `v1.4`의 `Default UI`를 사용했습니다. `Pagefind`는 몇 가지 아쉬움이 있었습니다.

검색 버튼 컴포넌트를 직접 만들어서 Pagefind에서 제공하는 `dialog`와 연결해야 했기 때문에 `Preact` 컴포넌트에서 `useEffect`로 Pagefind의 JS와 CSS를 런타임에 로드하고 `useRef`와 `eventListener`를 이용해 `dialog`와 검색 버튼을 연결하고 제어했습니다.

또한 빌드 시점에 인덱스를 생성하기 때문에 개발 서버에서는 검색 기능을 확인할 수 없어 검색 UI를 수정할 때마다 빌드 후 프리뷰를 이용해 확인해야 했습니다.

그리고 검색 `input`에 클리어 버튼을 추가하려고 했을 때 레이아웃이 원하는 방식으로 동작하지 않았는데 `Default UI`의 내부 구조를 쉽게 파악하기 어려웠습니다.

라이브러리 변경이나 해결책을 고민하는 도중 `Pagefind v1.5`에서 웹 컴포넌트 기반 `Component UI`가 추가되면서 검색 구조를 마이그레이션했습니다.

검색 트리거 버튼 컴포넌트도 추가되고, 공식 문서에서 `CSS Variables`를 공개해 이를 이용해 스타일을 쉽게 조정할 수 있어 이전에 사용하던 파일을 삭제하고 구조를 더 간단하게 만들 수 있었습니다.

`Pagefind`를 사용하면서 라이브러리를 선택할 때는 기능 뿐만 아니라 커스터마이징, 디버깅 경험도 함께 고려해야 한다는 점을 배웠습니다.

## 결과

이 프로젝트에서 가장 중요하게 생각한 것은 기술을 익숙해서 선택하지 않는 것이었습니다.

- `Astro`는 SSG 기반 콘텐츠 사이트에 적합하다고 판단해 선택했습니다.
- `Islands Architecture`를 이용해 필요한 부분에만 인터랙션을 추가했습니다.
- `Content Collections`로 블로그 글을 구조화했습니다.
- `Pagefind`로 서버 없는 정적 검색을 구현했고, v1.5 마이그레이션을 통해 코드를 개선했습니다.
- `Tailwind CSS Typography`와 디자인 토큰으로 마크다운 스타일과 색상 체계를 정리했습니다.
- `Satori`를 이용해 대표 이미지가 없는 글에도 동적 OG Image를 제공했습니다.
- `JSON-LD`, `canonical`, `Open Graph` 설정을 통해 페이지 단위 메타 데이터 관리 경험을 쌓았습니다.

앞으로도 여러 부분을 계속 개선하면서 장기적으로 관리할 계획입니다.

## 후기

[블로그 완성](https://sageherb.dev/blog/building-my-blog-with-astro)

[블로그 업데이트: Pagefind v1.5, OG Image 및 리팩토링](https://sageherb.dev/blog/blog-update-260504)
