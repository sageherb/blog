---
title: "블로그를 시작하며"
description: "Astro와 Tailwind CSS v4로 개인 기술 블로그를 직접 만들어본 과정을 기록합니다."
pubDate: 2026-02-01
updatedDate: 2026-02-15
tags: ["Astro", "Tailwind CSS", "블로그"]
draft: false
---

오랫동안 미뤄왔던 개인 블로그를 드디어 시작했습니다.

기존에는 Velog나 Medium 같은 플랫폼을 쓰면 편하지만, 직접 만들면서 배우는 게 더 낫겠다 싶어 Astro를 선택했습니다.

## 왜 Astro인가

Astro는 콘텐츠 중심 사이트에 최적화된 프레임워크입니다. 기본적으로 클라이언트 JavaScript를 전혀 보내지 않고, 필요할 때만 [Islands 패턴](https://docs.astro.build/en/concepts/islands/)으로 인터랙티브 컴포넌트를 추가할 수 있습니다.

블로그에 필요한 것들을 생각해보면:

- 빠른 로딩 속도
- SEO
- 마크다운/MDX 지원
- 정적 빌드

Astro는 이 모든 것을 기본으로 제공합니다.

## 스택

```
Astro v5 (SSG)
Tailwind CSS v4
TypeScript (strict)
Pagefind (검색)
```

## Tailwind CSS v4

이번 프로젝트에서 Tailwind v4를 처음 써봤습니다. `@theme {}` 블록에서 CSS 변수로 디자인 토큰을 정의하면 자동으로 유틸리티 클래스가 생성됩니다.

```css
@theme {
  --color-accent: #6b7d62;
}
```

이렇게 하면 `text-accent`, `bg-accent`, `border-accent`를 바로 쓸 수 있습니다.

앞으로 개발 과정에서 배운 것들을 틈틈이 기록해나갈 예정입니다.
