---
title: "개인 기술 블로그"
description: "Astro와 Tailwind CSS v4로 직접 제작한 개인 기술 블로그입니다. 정적 생성, 다크 모드, 전문 검색을 지원합니다."
pubDate: 2026-02-01
tags: ["Astro", "Tailwind CSS", "TypeScript"]
links:
  github: "https://github.com/sageherb/blog"
  live: "https://sageherb.dev"
draft: false
---

## 프로젝트 소개

Astro v5를 기반으로 제작한 개인 기술 블로그입니다. 플랫폼에 의존하지 않고 직접 설계하여, 성능과 SEO를 최대한 최적화했습니다.

## 주요 기능

- **정적 생성 (SSG)** — 모든 페이지를 빌드 타임에 생성해 CDN 배포
- **다크 모드** — `localStorage` 기반, 시스템 설정 자동 감지
- **전문 검색** — Pagefind를 Astro Island로 연동한 정적 호환 검색
- **MDX 지원** — 마크다운 내 컴포넌트 삽입 가능
- **자동 사이트맵 / RSS** — `@astrojs/sitemap`, `@astrojs/rss`

## 기술 선택 이유

| 항목       | 선택            | 이유                                             |
| ---------- | --------------- | ------------------------------------------------ |
| 프레임워크 | Astro v5        | 콘텐츠 중심, 제로 JS 기본값, Content Collections |
| 스타일     | Tailwind CSS v4 | CSS 변수 기반 디자인 토큰, 설정 없이 빠른 개발   |
| 검색       | Pagefind        | 빌드 결과물 인덱싱, 서버 불필요                  |

## Lighthouse 점수

모든 카테고리 100점을 목표로 설계했습니다.
