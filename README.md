# SageHerb

Astro 기반 개인 블로그

콘텐츠 중심의 구조를 유지하면서도, 검색성과 확장성을 함께 고려해 설계했습니다.

## 기술 스택

- Astro 7 (Sätteri 마크다운 프로세서)
- Tailwind CSS 4
- Astro Expressive Code (코드 블록 렌더링)
- Pagefind (클라이언트 검색)
- Satori + Preact JSX (동적 OG 이미지 생성)
- MDX, Sitemap, RSS 통합
- release-please (자동 버저닝)

## 주요 특징

- 블로그, 프로젝트, 소개 페이지를 하나의 콘텐츠 구조 안에서 일관되게 관리
- Astro Content Collections + Zod 스키마로 콘텐츠 작성 안정성 확보
- Astro Expressive Code로 코드 하이라이트, 복사, 다크 모드 테마 매핑 통합
- Pagefind 모달 트리거(`pagefind-modal-trigger`) 기반 정적 검색 (한국어 인덱스)
- Satori 기반 동적 OG 이미지 생성 (`/og/*.png`)
- JSON-LD 구조화 데이터, 사이트맵, RSS 자동 생성
- Sätteri 플러그인 기반 마크다운 확장 — 이미지 캡션, `:::note`/`:::center`/`:::row` directive (`src/utils/markdown.ts`)
- 본문 외부 링크에 아이콘 자동 표시 (텍스트 없는 아이콘·이미지 링크는 제외)
- `.dark` 클래스 토글 다크 모드 (서버 사이드 Astro 컴포넌트)
- `/` → `/blog` 영구 리다이렉트로 단일 네임스페이스 유지 (Vercel)
- 사이트 설정, 콘텐츠 스키마, UI 레이어를 분리해 유지보수성과 확장성 강화

## 폴더 구조

```text
src/
  assets/                                # 이미지·폰트 등 정적 에셋
  components/
    blog/                                # PostCard, PostList, PostCardMeta
    layout/                              # BaseHead, Header, Footer, ThemeToggle, PagefindSearch
    project/                             # ProjectCard, ProjectList, ProjectCardMeta 등
    ui/                                  # Badge, CardTitle, CardDescription, Prose, Pagination, IconGithub 등 공통 프리미티브
  content/                               # 블로그·프로젝트·소개 콘텐츠 원본
    about/, blog/, project/
  content.config.ts                      # Content Collections 스키마 정의
  config.ts                              # 사이트 전역 설정 상수
  layouts/                               # BaseLayout, PostLayout, ProjectLayout
  pages/                                 # 라우팅 엔트리
    blog/[...page].astro, blog/[slug].astro
    project/index.astro, project/[slug].astro
    tags/[tag]/...
    og/, about.astro, rss.xml.ts
  styles/                                # 전역 스타일·Tailwind 토큰
  utils/                                 # content, date, jsonld, markdown(Sätteri 플러그인), pagination, routes, tags 헬퍼 + og/ (Satori 템플릿·폰트·렌더)
```

경로 별칭은 `tsconfig.json`에 정의되어 있으며 `@components/*`, `@layouts/*`, `@utils/*`, `@content/*`, `@styles/*`, `@assets/*`, `@config`을 사용합니다.

## 실행 명령어

Node.js 24, pnpm 환경에서 프로젝트 루트에서 실행합니다.

- `pnpm install`: 의존성 설치
- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드 + Pagefind 인덱스 생성
- `pnpm preview`: 빌드 결과 로컬 미리보기
- `pnpm check`: Astro 타입 체크
- `pnpm lint` / `pnpm lint:fix`: ESLint 검사 · 자동 수정
- `pnpm verify`: lint + prettier check + astro check + build (배포 전 통합 검증)

## 콘텐츠 작성 규칙

콘텐츠 스키마는 `src/content.config.ts`에서 관리합니다.

### Blog (`src/content/blog/*.md`, `*.mdx`)

| 필드          | 타입       | 필수 | 기본값  | 비고           |
| ------------- | ---------- | :--: | :-----: | -------------- |
| `title`       | `string`   |  ✓   |    —    |                |
| `description` | `string`   |  ✓   |    —    |                |
| `pubDate`     | `date`     |  ✓   |    —    | 발행일         |
| `tags`        | `string[]` |      |  `[]`   |                |
| `coverImage`  | `image`    |      |    —    | optional       |
| `draft`       | `boolean`  |      | `false` | 목록 노출 여부 |

### Project (`src/content/project/*.md`, `*.mdx`)

| 필드          | 타입       | 필수 | 기본값  | 비고                                |
| ------------- | ---------- | :--: | :-----: | ----------------------------------- |
| `title`       | `string`   |  ✓   |    —    |                                     |
| `description` | `string`   |  ✓   |    —    |                                     |
| `pubDate`     | `date`     |  ✓   |    —    |                                     |
| `startDate`   | `date`     |      |    —    | 프로젝트 시작일                     |
| `endDate`     | `date`     |      |    —    | 생략 시 "진행 중"으로 표시          |
| `techStack`   | `string[]` |      |  `[]`   |                                     |
| `coverImage`  | `image`    |      |    —    |                                     |
| `links`       | `object`   |      |    —    | `github`, `live` 각각 URL, optional |
| `draft`       | `boolean`  |      | `false` |                                     |

- `startDate`가 있으면 프로젝트 기간을 "2026년 3월 — 2026년 3월" 형태로 표시합니다.
- 프로젝트 목록은 `startDate` 기준 최신순으로 정렬됩니다 (`startDate` 없으면 `pubDate`).

### About (`src/content/about/index.md`)

| 필드          | 타입      | 필수 | 기본값  |
| ------------- | --------- | :--: | :-----: |
| `title`       | `string`  |  ✓   |    —    |
| `description` | `string`  |  ✓   |    —    |
| `draft`       | `boolean` |      | `false` |

### 마크다운 확장 문법

`src/utils/markdown.ts`의 Sätteri 플러그인이 처리합니다.

- **이미지 캡션**: 이미지 title이 `<figure>` + `<figcaption>`으로 변환됩니다. 캡션 안에 `[텍스트](url)` 링크도 쓸 수 있습니다.

  ```markdown
  ![대체 텍스트](../../assets/example.png "캡션 — [출처](https://example.com)")
  ```

- **directive**: `:::note`(제목은 `{title="..."}` 옵션), `:::center`(이미지·캡션 중앙 정렬), `:::row`(이미지 2개 좌우 배치, 모바일에서는 1열).

  ```markdown
  :::note{title="참고"}
  노트 본문
  :::

  :::row
  ![왼쪽](a.png "왼쪽 캡션")

  ![오른쪽](b.png)
  :::
  ```

- 플러그인(`src/utils/markdown.ts`)을 수정한 뒤에는 콘텐츠 캐시 때문에 `pnpm dev --force` 또는 `pnpm build --force`로 실행해야 반영됩니다.

## 검색 (Pagefind)

- 검색 UI는 `PagefindSearch.astro` 컴포넌트가 `pagefind-modal-trigger`, `pagefind-modal` 웹 컴포넌트를 통해 lazy-load 합니다.
- 인덱스는 `pnpm build` 시 `pagefind --site dist`로 생성됩니다.
- 인덱싱 언어는 한국어(`lang="ko"`)로 설정되어 있습니다.
- 검색 대상에서 제외할 영역은 `data-pagefind-ignore` 속성으로 제어합니다.

## 코드 블록

- `astro-expressive-code`가 모든 Markdown/MDX 코드 블록을 처리합니다.
- `title`은 코드 블록 상단에 표시되는 파일 이름입니다.
- `caption`은 선택 사항이며 코드 블록 하단에 캡션을 표시합니다. 캡션 안에 `[텍스트](url)` 링크도 쓸 수 있습니다.

  ````markdown
  ```ts title="src/utils/markdown.ts" caption="캡션 — [출처](https://example.com)"
  export function imageCaptionsPlugin() {}
  ```
  ````

- 라이트/다크 테마는 각각 `catppuccin-latte`/`catppuccin-frappe`이며, `.dark` 클래스 셀렉터로 매핑됩니다.
- 복사 버튼은 Expressive Code 기본 기능을 사용하므로 별도 클라이언트 스크립트가 필요하지 않습니다.

## OG 이미지

- `src/pages/og/` 라우트가 빌드 시 Satori + `resvg`로 PNG를 생성합니다.
- 템플릿(`src/utils/og/template.tsx`)은 Preact JSX로 작성되며, `tsconfig`의 `jsxImportSource: "preact"` 설정을 따릅니다.
- 사이트맵 생성 시 OG 경로는 제외됩니다 (`astro.config.mjs`의 `sitemap` 필터).

## 환경 설정

- 사이트 기본 설정: `src/config.ts`
- 주요 상수: `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR`, `BRAND_COLOR`, `DEFAULT_OG_IMAGE`, `COPYRIGHT_NAME`, `LICENSE`, `POSTS_PER_PAGE`, `PAGE_BLOCK_SIZE`, `SOCIAL_LINKS`.
- 배포 환경이 변경되더라도 한 곳만 수정하면 전체에 반영되도록 설계했습니다.

## 배포 · 릴리스

- Vercel 배포를 가정하며, `vercel.json`에서 `/` → `/blog`, `/blog/1` → `/blog` 영구 리다이렉트를 처리합니다.
- 버전 관리는 `release-please`로 자동화되어 있으며, Conventional Commits 메시지를 기준으로 `CHANGELOG.md`와 `package.json`이 갱신됩니다.
