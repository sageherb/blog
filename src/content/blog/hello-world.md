---
title: "블로그를 시작하며"
description: "Astro와 Tailwind CSS v4로 개인 기술 블로그를 직접 만들어본 과정을 기록합니다."
pubDate: 2026-02-01
updatedDate: 2026-03-01
tags: ["Astro", "Tailwind CSS", "TypeScript"]
draft: false
---

오랫동안 미뤄왔던 개인 블로그를 드디어 시작했습니다.

Velog나 Medium 같은 플랫폼을 쓰는 것이 편하지만, 직접 만들면서 배우는 쪽이 더 낫겠다 싶어 Astro를 선택했습니다.

## 왜 Astro인가

Astro는 콘텐츠 중심 사이트에 최적화된 프레임워크입니다. 기본적으로 클라이언트 JavaScript를 전혀 보내지 않고, 필요할 때만 [Islands 아키텍처](https://docs.astro.build/en/concepts/islands/)로 인터랙티브 컴포넌트를 추가할 수 있습니다.

블로그에 필요한 것들을 생각해보면:

- 빠른 로딩 속도
- SEO
- 마크다운/MDX 지원
- 정적 빌드

Astro는 이 모든 것을 기본으로 제공합니다.

## 스택

- **Astro v5 (SSG)** — 콘텐츠 중심, 제로 JS 기본값
- **Tailwind CSS v4** — CSS 변수 기반 디자인 토큰
- **TypeScript (strict)** — 명시적 타입, no `any`
- **Pagefind** — 빌드 결과물 인덱싱, 서버 불필요
- **Netlify** — 정적 빌드 + CDN

## Tailwind CSS v4

이번 프로젝트에서 Tailwind v4를 처음 써봤습니다. `@theme {}` 블록에서 CSS 변수로 디자인 토큰을 정의하면 자동으로 유틸리티 클래스가 생성됩니다.

```css
@theme {
  --color-accent: #6b7d62;
  --color-bg: #f8f7f4;
}
```

이렇게 정의하면 `text-accent`, `bg-accent`, `border-accent` 등을 바로 사용할 수 있습니다. 다크 모드는 `.dark` 클래스를 `<html>`에 토글하는 방식으로 구현했습니다.

```css
.dark {
  --color-accent: #8fa882;
  --color-bg: #1c1f1a;
}
```

앞으로 개발하면서 배운 것들을 틈틈이 기록해나갈 예정입니다.
