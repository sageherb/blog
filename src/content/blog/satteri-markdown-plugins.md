---
title: 마크다운 기능 Sätteri 플러그인으로 직접 만들기
description: 이미지 캡션, 노트, 이미지 정렬을 구현해 MDX 의존 줄이기
pubDate: 2026-07-10
tags:
  - Markdown
  - Satteri
draft: false
---

Astro 7로 블로그를 업그레이드하면서 기본 마크다운 파이프라인이 `Sätteri`로 바뀌었다. Satteri는 Rust로 작성돼서 빠른 게 장점인데 알고 보니 Astro 코어 팀원이 만든 거였다.

마침 글을 쓸 때 필요한 마크다운 기능이 몇 가지 있었는데, 이번 기회에 플러그인으로 직접 만들어봤다.

## 이미지 캡션 플러그인

### 캡션처럼 보이지만 캡션이 아님

이전에는 이미지 밑에 캡션을 달고 싶어도 마크다운에 캡션 문법이 없어서 `mdx`에서 `small` 태그를 사용하고 있었다.

```mdx
![이미지 설명](이미지 주소)

<small>이미지 캡션</small>
```

`small`은 이미지 캡션을 의미하는 시맨틱 태그도 아니고, 일단 캡션처럼 보이게만 해놓은 상태였다.

### 이미지 title을 캡션으로 사용

그래서 이미지 캡션 플러그인을 직접 만들어 Satteri에 연결했다. 새로운 문법을 만드는 대신, 마크다운 표준 문법인 이미지 `title`을 캡션으로 사용했다.

```md
![이미지 설명](이미지 주소 "이미지 캡션 [링크도 가능](주소)")
```

`title`은 이미지에 호버해야 툴팁으로 보이는 속성이라 모바일에서는 볼 수 없고, 이미지 설명은 대체 텍스트인 `alt`가 이미 담당한다. 사실상 남는 속성이라 캡션으로 사용해도 잃는 게 없었다.

### 이미지와 캡션을 figure 구조로 변환

플러그인은 `title`이 달린 `img`를 `figure`와 `figcaption` 구조로 교체한다. 이때 `title` 속성은 제거해서 캡션과 브라우저 툴팁이 중복되지 않게 했다.

캡션 안에 쓴 `[링크](주소)` 문법도 문자열을 직접 파싱해 `a` 태그로 변환해 준다.

### 예외 처리: 단독 이미지일 때만 변환하기

조건도 하나 필요했다. 마크다운에서 이미지는 인라인 문법이라 기본적으로 `<p>` 안에 렌더링된다.

```html
<p><img src="cat.jpg" alt="단독 이미지" /></p>
```

문장 중간에 이미지를 넣으면 텍스트와 이미지가 같은 `<p>` 안에 포함된다.

```html
<p>문장 속에 <img src="icon.png" alt="아이콘" /> 이미지가 섞일 수도 있다.</p>
```

캡션이 필요한 건 첫 번째처럼 단독 이미지뿐이다. 문장 중간에 들어간 이미지까지 `figure`로 바꾸면 문장이 이미지 자리에서 끊기고, HTML 규칙상 `p` 안에 `figure`가 들어갈 수도 없다.

그래서 플러그인은 첫 번째 경우처럼 이미지가 문단의 유일한 자식일 때만 문단째 `figure`로 교체하고, 두 번째 경우는 그대로 둔다.

```html
<figure>
  <img src="cat.jpg" alt="단독 이미지" />
  <figcaption>이미지 캡션</figcaption>
</figure>
```

같은 문법이라도 위치에 따라 렌더링이 달라져야 했는데, AST를 직접 다루니 이런 조건 분기가 가능했다.

## Note와 정렬 플러그인

### directive로 ::: 문법 추가

Satteri의 `directive` 기능을 켜면 `:::` 문법을 파싱할 수 있다.

```md
:::directive{title=""}
내용
:::
```

다만 파싱만 해줄 뿐 그 결과를 어떤 HTML로 바꿀지는 정해주지 않는다. 변환하는 부분은 직접 작성해야 한다.

### note를 aside로 변환

`:::note`는 `aside` 태그로 변환했다. `title` 속성이 있으면 제목 노드를 AST에 직접 주입한다.

```html
<aside role="note" aria-label="NOTE">
  <p aria-hidden="true">NOTE</p>
  <p>노트를 작성할 수 있다.</p>
</aside>
```

:::note{title="NOTE"}
노트를 작성할 수 있다.
:::

스타일도 플러그인에서 함께 부여한다. 덕분에 기존에 쓰던 `Note` 컴포넌트를 삭제할 수 있었고, `md`와 `mdx` 어디서든 import 없이 동일하게 렌더링된다.

### center와 row로 이미지 정렬

이미지 중앙 정렬과 여러 이미지를 나란히 배치하는 기능도 같은 `directive` 플러그인에서 처리했다.

```md
:::center
![이미지 설명](이미지 주소)
:::

:::row
![이미지 1](이미지 주소)

![이미지 2](이미지 주소)
:::
```

`:::center`는 중앙 정렬 `div`로 감싸고, `:::row`는 그리드로 배치하는 `div`로 감싼다.

```html
<div class="flex flex-col items-center ...">
  <p><img src="cat.jpg" alt="이미지 설명" /></p>
</div>

<div class="grid gap-4 sm:grid-cols-2 ...">
  <p><img src="cat1.jpg" alt="이미지 1" /></p>
  <p><img src="cat2.jpg" alt="이미지 2" /></p>
</div>
```

### row에서 빈 줄이 필요한 이유

`:::row`에서 이미지 사이를 빈 줄로 구분한 이유는 이미지 캡션을 구현할 때 겪은 문제와 비슷하다.

```html
<p>
  <img src="cat1.jpg" alt="이미지 1" />
  <img src="cat2.jpg" alt="이미지 2" />
</p>
```

연속된 줄로 쓰면 이미지 두 개가 한 `<p>`에 묶여 그리드 아이템이 하나가 되고, 빈 줄로 구분해야 `<p>`가 나뉘면서 나란히 배치된다.

## mdast와 hast

`Satteri`는 플러그인이 두 종류로 나뉜다. `mdast`와 `hast`.

이 두 개는 `unified` 마크다운 생태계에서 쓰는 AST 규격인데,

- `mdast`는 마크다운 추상 트리 규격이고
- `hast`는 HTML 추상 트리 규격이다.

그리고 이 두 단계를 거쳐 최종 HTML을 생성한다. 정리하자면, `Markdown > mdast > hast > HTML`이 된다.

unified 생태계에서 `remark`는 mdast 단계를 담당하고 `rehype`는 hast 단계를 담당한다. Satteri는 이 두 종류의 단계를 플러그인 훅으로 제공해서 쓸 수 있게 해준다.

```js title="astro.config.mjs"
markdown: {
  processor: satteri({
    features: { directive: true },
    mdastPlugins: [directivesPlugin()],
    hastPlugins: [imageCaptionsPlugin()],
  }),
},
```

`directive`는 마크다운 AST를 다루는 단계에서 사용되고, 이미지 캡션은 HTML AST를 다루는 단계에서 사용된다. 두 플러그인의 단계가 다른 이유는 처리하는 일이 다르기 때문이다.

directive는 mdast 단계에서 `:::note` 같은 노드에 **aside로 변환하라**는 정보만 붙이고, 실제 HTML 변환은 파이프라인에 맡긴다.

반면 이미지 캡션은 `figure`와 `figcaption` 구조를 만드는 일이라 HTML 트리가 완성된 hast 단계에서 처리한다.

## 마무리

마크다운 기능을 플러그인으로 직접 추가하면서 컴포넌트 import가 필요 없어졌고, 이제 웬만한 글은 `mdx`를 쓰지 않고 `md`만으로 처리가 가능하게 됐다.

블로그를 직접 만들고 유지하면서 생각 이상으로 배우는 게 많다.

며칠 전에는 `remark`로 이력서 PDF 자동화 프로젝트를 만들었는데, 이어서 `Satteri` 플러그인까지 만들면서 마크다운 파싱 과정에 대한 이해가 많이 늘었다.
