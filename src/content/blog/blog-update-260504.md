---
title: "블로그 업데이트: Pagefind v1.5, OG Image 및 리팩토링"
description: "Pagefind v1.5 마이그레이션, OG Image 추가 및 리팩토링 과정"
pubDate: 2026-05-04
tags:
  - Blog
  - Pagefind
  - Open Graph
  - Refactoring
draft: false
---

블로그를 업데이트 했다. 중간중간 자잘한 수정은 계속 있었지만, 이번에는 여러 부분을 바꿨다.

검색 라이브러리인 `Pagefind`를 v1.5로 올리면서 `Component UI`로 마이그레이션 했고, `satori`를 이용한 동적 OG Image 디자인도 추가했다. 그 외에도 공통 컴포넌트 추출, 메타 데이터, 코드 블록 복사 버튼 등 몇 가지 리팩토링도 진행했다.

## Pagefind v1.5

기존 Pagefind v1.4를 사용할 땐 검색 버튼 컴포넌트를 따로 만들고 `Default UI` CSS와 JS를 런타임에 로드하고 인스턴스를 생성한 뒤 `dialog`와 검색 버튼을 연결하는 코드를 작성해야 했다.

그래서 `useEffect` 안에서 DOM을 조작하고 `useRef`와 `eventListener`를 사용해 검색 모달 제어를 직접 관리해야 했다.

검색 버튼에 표시되는 단축키도 운영체제를 판별해 맥에선 커맨드가, 윈도우에선 컨트롤이 뜨도록 하고 있었는데 페이지가 바뀔 때마다 레이아웃 시프트가 생기는 문제가 있었다.

근데 이번에 v1.5가 되면서 웹 컴포넌트 기반 `Component UI`가 추가돼서 쓰기가 매우 간단해졌다!

```html
<pagefind-config lang="ko"></pagefind-config>
<pagefind-modal-trigger
  shortcut="mod+k"
  compact
  placeholder="검색 열기"
  aria-label="검색 열기"
  class="pagefind-search-trigger"
></pagefind-modal-trigger>
<pagefind-modal reset-on-close></pagefind-modal>
```

웹 컴포넌트를 사용하면서 기존 프로젝트에 있던 `SearchButton`과 `SearchDialog` 파일을 없앨 수 있었고 덕분에 코드로 확 줄었다.

트리거 컴포넌트인 `pagefind-modal-trigger`도 제공하고 `shortcut` 기능이 기본적으로 탑재돼서 직접 운영체제를 판별할 필요도 없어졌다.

UI 수정도 웹 컴포넌트라서 전보다 많이 편해졌고, 공식 문서에서 `CSS Variables`도 제공하고 있어서 CSS 수정만으로 쉽게 디자인 제어가 가능했다.

## 동적 OG Image 추가

Vercel에서 만든 `Satori`를 이용해 동적 OG Image도 추가했다.

글에 별도의 대표 이미지가 있으면 해당 이미지를 `og:image`로 사용하고, 없으면 `Satori`로 생성한 동적 OG Image를 사용한다.

디자인은 처음 맥 윈도우 모양에 영감을 받아 만들었는데, 각 플랫폼마다 보여지는 이미지 크기가 조금씩 달라서 미니멀 타이포그래픽 방식으로 변경했다. 상단에는 블로그 주소, 하단엔 날짜와 태그가 보여지고 중앙엔 글 제목만 크게 보이도록 했다.

## 리팩토링

이 외에도 몇 가지 리팩토링을 진행했다.

처음에 블로그를 만들었을 땐, 루트 페이지에서 `/blog`로 리다이렉트 하는 방식을 사용했었다. 하지만 아스트로 정적 빌드에서 리다이렉트는 브라우저가 리다이렉트용 HTML을 한 번 받은 뒤 이동하게 된다. 이 과정에서 빈 페이지가 잠깐 깜빡이는 현상이 있었다.

이 문제를 해결하기 위해 임시적으로 두 페이지에서 같은 코드를 사용하고 있었는데, 그 코드를 공통 컴포넌트로 분리하고 `canonical`은 루트 페이지를 기준으로 했다.

그리고 메타 데이터 확인을 위해 돌아다니다가 `JSON-LD`를 알게 됐고, md 파일의 `frontmatter`를 이용해 `JSON-LD`를 자동으로 생성하는 `utils` 파일도 만들었다.

코드 블록 복사 버튼도 리팩토링을 진행했다. 기존에는 `Preact` 컴포넌트를 만들어 `useEffect`로 DOM을 찾아 버튼을 삽입하는 방식이었는데, `useEffect`를 사용하는 게 과하게 느껴졌다.

그래서 `rehype` 단계에서 코드 블록을 만들 때 복사 버튼도 함께 만들고 이후 렌더된 버튼의 클릭 이벤트만 처리하도록 변경했다.

## 마무리

이번 업데이트는 블로그를 완성한 뒤 미뤄뒀던 작업을 한 번에 정리했다.

Astro 메이저 버전이 업데이트 됐을 땐 내 블로그에는 크게 손봐야 할 사항이 없었는데, Pagefind v1.5 변경 사항을 보고 마이그레이션이 필요하다고 판단했다. 작업을 시작하다보니 고치면 좋을 것들이 보여서 함께 건드리게 됐다.

겸사겸사 버전 관리도 시작했다. 첫 완성 이후 비교적 큰 업데이트이니 `v1.1.0` 정도로 볼 수 있을 것 같다.
