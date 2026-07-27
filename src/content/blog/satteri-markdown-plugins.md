---
title: 마크다운 기능 Sätteri 플러그인으로 직접 만들기
description: 이미지 캡션, 노트, 이미지 정렬을 구현해 MDX 의존 줄이기
pubDate: 2026-07-10
tags:
  - Markdown
  - Satteri
draft: false
---

Astro 7로 블로그를 업그레이드하면서 기본 마크다운 파이프라인이 **Sätteri**로 바뀌었다. Satteri는 Rust로 작성돼서 빠른 게 장점인데 알고 보니 Astro 코어 팀원이 만든 거였다.

마침 글을 쓸 때 필요한 마크다운 기능이 몇 가지 있었는데 이번 기회에 플러그인으로 직접 만들어봤다.

## 이미지 캡션 플러그인

이전에는 이미지 밑에 캡션을 달고 싶어도 마크다운에 캡션 문법이 없어서 MDX에서 `small` 태그를 사용했다.

```mdx
![이미지 설명](이미지 주소)

<small>이미지 캡션</small>
```

`small`은 이미지 캡션을 의미하는 시맨틱 태그도 아니고 일단 캡션처럼 보이게만 해놓은 상태였다.

그래서 마크다운 표준 문법인 이미지 [title](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#the_title_attribute)을 캡션으로 사용하는 플러그인을 만들었다. 타이틀은 이미지 호버 시 툴팁으로 보이는 속성인데 모바일에서는 보이지 않고 설명은 `alt`가 이미 담당해서 캡션으로 변경해도 리스크가 없었다.

```md
![이미지 설명](이미지 주소 "이미지 캡션 [링크도 가능](주소)")
```

플러그인은 이미지와 캡션을 [figure](https://developer.mozilla.org/ko/docs/Web/HTML/Reference/Elements/figure) 구조로 교체한다. `title` 속성은 제거해서 캡션과 브라우저 툴팁이 중복되지 않게 했다.

캡션 안에 쓴 링크 문법도 문자열을 파싱해 `a` 태그로 변환한다.

### 예외 처리: 단독 이미지일 때만 변환하기

마크다운에서 이미지는 인라인 문법이라 기본적으로 `p` 안에 렌더링된다. 텍스트 중간 삽입도 가능하다.

```html
<p><img src="cat.jpg" alt="단독 이미지" /></p>

<p>문장 속에 <img src="icon.png" alt="아이콘" /> 이미지가 섞일 수도 있다.</p>
```

캡션이 필요한 건 첫 번째처럼 단독 이미지뿐이다. 그래서 이미지가 문단의 유일한 자식이고 캡션이 있을 때만 변환하도록 했다.

## directive를 이용한 플러그인

Satteri의 `directive` 기능을 켜면 `:::` 문법을 파싱할 수 있다. 다만 파싱만 해줄 뿐 어떤 HTML로 바꿀지는 정해주지 않아서 변환하는 부분은 직접 작성해야 한다.

### note를 aside로 변환

```md
:::note{title="NOTE"}
노트를 작성할 수 있다.
:::
```

:::note{title="NOTE"}
노트를 작성할 수 있다.
:::

`:::note`는 `aside` 태그로 변환했다. `title` 속성이 있으면 제목 노드를 AST에 추가한다.

Tailwind 클래스도 플러그인 단계에서 추가하기 때문에 기존에 있던 `Note` 컴포넌트를 없애고 `:::note`로 통일했다.

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

`:::center`는 중앙 정렬 `div`로 감싸고 `:::row`는 그리드로 배치하는 `div`로 감싼다.

`:::row`에서는 이미지 사이를 빈 줄로 구분하는 게 중요한데, 붙여서 쓰면 이미지 두 개가 한 `<p>`에 묶여 정렬되지 않는다. 이미지 캡션에서 겪은 문제와 같은 이유다.

## mdast와 hast

Satteri 플러그인은 **mdast**와 **hast** 두 종류로 나뉜다.

둘 다 unified 마크다운 생태계에서 쓰는 AST 규격이다.

- `mdast`는 마크다운 추상 트리 규격이고
- `hast`는 HTML 추상 트리 규격이다.

이 두 단계를 거쳐 최종 HTML을 생성한다. `Markdown > mdast > hast > HTML` 순서로 처리된다.

unified 생태계에서 remark는 mdast 단계를 담당하고 rehype는 hast 단계를 담당한다.

Satteri는 이 두 종류의 단계를 플러그인 훅으로 제공한다.

```js title="astro.config.mjs"
markdown: {
  processor: satteri({
    features: { directive: true },
    mdastPlugins: [directivesPlugin()],
    hastPlugins: [imageCaptionsPlugin()],
  }),
},
```

directive는 마크다운 AST를 다루는 단계에서 사용하고 이미지 캡션은 HTML AST를 다루는 단계에서 사용했다. 두 플러그인의 단계가 다른 이유는 처리하는 일이 다르기 때문이다.

directive는 mdast 단계에서 `:::note` 같은 노드에 **aside로 변환하라**는 정보만 붙이고 실제 HTML 변환은 파이프라인에 맡긴다.

반면 이미지 캡션은 HTML의 `figure`와 `figcaption` 구조를 만드는 일이라 hast 단계에서 처리한다.

실제 플러그인의 뼈대는 이렇다. mdast 플러그인은 노드에 데이터를 주입하고 hast 플러그인은 완성된 HTML 트리를 직접 교체한다.

```ts title="src/utils/markdown.ts"
export function directivesPlugin(): MdastPlugin {
  return {
    name: "content-directives",
    containerDirective(node, ctx) {
      ctx.setProperty(node, "data", {
        hName: "aside",
        hProperties: { role: "note", class: NOTE_CLASSES },
      });
    },
  };
}

export function imageCaptionsPlugin(): HastPlugin {
  return {
    name: "image-captions",
    element: {
      filter: ["img"],
      visit(node, ctx) {
        ctx.replaceNode(ctx.parent(node), captionedFigure(node, caption));
      },
    },
  };
}
```

전체 구현은 [markdown.ts](https://github.com/sageherb/blog/blob/main/src/utils/markdown.ts)에서 볼 수 있다.

## 마무리

마크다운 기능을 플러그인으로 직접 추가하면서 컴포넌트 import가 필요 없어졌다. 이제 웬만한 글은 MDX를 쓰지 않고 마크다운만으로도 처리가 가능해졌다.

블로그를 직접 만들고 유지하면서 생각 이상으로 배우는 게 많다.

며칠 전에는 `remark`로 이력서 PDF 자동화 프로젝트를 만들었는데 `Satteri` 플러그인까지 만들면서 마크다운 파싱 과정에 대한 이해가 많이 늘었다.

## Reference

- [Sätteri](https://satteri.bruits.org/)

- [remark-directive](https://github.com/remarkjs/remark-directive)
