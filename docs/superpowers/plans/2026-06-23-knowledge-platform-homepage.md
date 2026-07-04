# Knowledge Platform Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing static site from a single-source “平哥聊职教” digest into a modern knowledge management homepage with two launch sections: “产教融合” and “数字化转型”.

**Architecture:** Keep the project as a static single-page site under `site/`. Add a unified content JSON file consumed by `site/app.js`, with section/source filters and a reader dialog. Replace the existing sidebar layout with a portal hero plus a content workbench.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, JSON data, local `python3 -m http.server` verification.

---

## File Structure

- Modify `site/index.html`: Replace the single-account layout with a platform shell, hero, section cards, search/workbench area, and reader dialog.
- Modify `site/app.js`: Load unified content, normalize filters, render stats/section cards/source filters/content cards, and open detail reader.
- Modify `site/styles.css`: Replace the old paper/sidebar visual style with a modern portal/workbench responsive layout.
- Create `site/data/content.json`: Unified platform data containing the existing “平哥聊职教” entries and real “数字周参” entries from `site/data/ima_raw.json`.
- Keep `site/data/articles.json`: Preserve old data as source material and fallback reference.

## Task 1: Create Unified Content Data

**Files:**
- Create: `site/data/content.json`
- Read: `site/data/articles.json`
- Read: `site/data/ima_raw.json`

- [ ] **Step 1: Inspect current data sources**

Run:

```bash
node -e "const pg=require('./site/data/articles.json'); const ima=require('./site/data/ima_raw.json'); console.log({pingge: pg.articles.length, digitWeekly: ima.length, firstDigitWeekly: ima[0]?.title});"
```

Expected: prints counts for the current “平哥聊职教” articles and `数字周参` raw items.

- [ ] **Step 2: Create `site/data/content.json`**

Create a JSON object with this shape:

```json
{
  "generatedAt": "2026-06-23",
  "platform": {
    "name": "知行知识库",
    "tagline": "把行业观察整理成可检索、可复用的知识资产",
    "description": "围绕职业教育与数字化转型，沉淀来源、观点、案例、清单与精读笔记。"
  },
  "sections": [
    {
      "id": "industry-education",
      "name": "产教融合",
      "source": "平哥聊职教",
      "description": "聚焦职业教育、校企合作、专业建设和产教融合项目方法论。",
      "accent": "green"
    },
    {
      "id": "digital-transformation",
      "name": "数字化转型",
      "source": "数字周参",
      "description": "跟踪教育信息化、学校数字化治理、行业趋势和项目落地逻辑。",
      "accent": "blue"
    }
  ],
  "items": []
}
```

Populate `items` with:

- All 10 existing `平哥聊职教` entries from `site/data/articles.json`, mapped to:
  - `source`: `平哥聊职教`
  - `sourceType`: `douyin`
  - `section`: `产教融合`
  - `sectionId`: `industry-education`
  - `contentType`: `video_digest`
  - `body`: old `transcript`
  - `url`: old account profile URL
- At least 10 real `数字周参` entries from `site/data/ima_raw.json`, mapped to:
  - `id`: `dw-001`, `dw-002`, etc.
  - `source`: `数字周参`
  - `sourceType`: `wechat`
  - `section`: `数字化转型`
  - `sectionId`: `digital-transformation`
  - `contentType`: `article_digest`
  - `title`: raw title
  - `url`: raw `media_info.url_info.url`
  - `summary`: short non-fictional summary derived from the title only, such as `围绕“学校购买的不是信息化产品，而是治理确定性”展开的数字化转型观察。`
  - `body`: `该条目来自数字周参文章索引，当前站点先保留标题、来源和原文链接，后续可补充详细精读。`
  - `tags`: infer conservative tags from the title, such as `["数字化转型", "教育信息化"]`
  - `publishedAt`: empty string if unavailable
  - `publishedLabel`: `来自文章索引`
  - `note`: `来自本地 IMA 原始索引；未复制公众号全文。`

- [ ] **Step 3: Validate JSON**

Run:

```bash
node -e "const data=require('./site/data/content.json'); console.log(data.sections.map(s=>s.name).join(',')); console.log(data.items.length); console.log([...new Set(data.items.map(i=>i.section))].join(','));"
```

Expected:

```text
产教融合,数字化转型
20
产教融合,数字化转型
```

If the “数字周参” source has more than 10 entries, using more than 10 is acceptable as long as all entries are real.

## Task 2: Replace HTML With Platform Structure

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1: Replace page title and body structure**

Use this high-level structure in `site/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>知行知识库 · 知识管理平台</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="#top" aria-label="知行知识库首页">
          <span class="brand-mark">知</span>
          <span class="brand-text">知行知识库</span>
        </a>
        <nav class="nav-links" aria-label="主导航">
          <a href="#top">首页</a>
          <a href="#industry-education">产教融合</a>
          <a href="#digital-transformation">数字化转型</a>
          <a href="#sources">来源</a>
          <a href="#workbench">检索</a>
        </nav>
      </header>

      <main id="top">
        <section class="hero" aria-labelledby="heroTitle">
          <div class="hero-copy">
            <p class="eyebrow">Knowledge Intelligence</p>
            <h1 id="heroTitle">把行业观察整理成可检索、可复用的知识资产</h1>
            <p id="platformDescription" class="hero-lede"></p>
            <div class="hero-stats" aria-label="平台统计">
              <div><strong id="totalCount">0</strong><span>条内容</span></div>
              <div><strong id="sectionCount">2</strong><span>个板块</span></div>
              <div><strong id="sourceCount">2</strong><span>个来源</span></div>
            </div>
          </div>
          <div id="sectionCards" class="section-cards" aria-label="知识板块"></div>
        </section>

        <section id="workbench" class="workbench" aria-labelledby="workbenchTitle">
          <div class="workbench-head">
            <div>
              <p class="eyebrow">Workbench</p>
              <h2 id="workbenchTitle">内容检索与精读</h2>
            </div>
            <p id="generatedAt" class="generated"></p>
          </div>

          <div class="workbench-layout">
            <aside class="filters" aria-label="筛选条件">
              <div class="filter-block">
                <h3>板块</h3>
                <div id="sectionFilters" class="filter-list"></div>
              </div>
              <div id="sources" class="filter-block">
                <h3>来源</h3>
                <div id="sourceFilters" class="filter-list"></div>
              </div>
              <p id="sourceNote" class="source-note"></p>
            </aside>

            <section class="content-panel" aria-label="内容列表">
              <div class="search-row">
                <label class="sr-only" for="searchInput">搜索内容</label>
                <input id="searchInput" type="search" placeholder="搜索标题、摘要、标签、来源、精读正文" />
                <button id="clearFilters" class="secondary-button" type="button">重置</button>
              </div>
              <div id="activeSummary" class="active-summary"></div>
              <div id="articleGrid" class="article-grid" aria-live="polite"></div>
            </section>
          </div>
        </section>
      </main>
    </div>

    <div id="reader" class="reader" aria-hidden="true">
      <div class="reader-backdrop" data-close></div>
      <article class="reader-panel" role="dialog" aria-modal="true" aria-labelledby="readerTitle">
        <button class="icon-button" type="button" data-close aria-label="关闭">×</button>
        <p id="readerKicker" class="eyebrow"></p>
        <h2 id="readerTitle"></h2>
        <p id="readerMeta" class="reader-meta"></p>
        <section class="reader-section">
          <h3>摘要</h3>
          <p id="readerSummary"></p>
        </section>
        <section class="reader-section">
          <h3>精读内容</h3>
          <div id="readerBody" class="reader-body"></div>
        </section>
        <p id="readerNote" class="reader-note"></p>
        <a id="readerLink" class="source-link" target="_blank" rel="noreferrer">打开来源</a>
      </article>
    </div>

    <script src="./app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Sanity check HTML IDs**

Run:

```bash
node -e "const fs=require('fs'); const html=fs.readFileSync('./site/index.html','utf8'); for (const id of ['sectionCards','sectionFilters','sourceFilters','searchInput','clearFilters','articleGrid','reader']) { if (!html.includes('id=\"'+id+'\"')) throw new Error('missing '+id); } console.log('html ids ok');"
```

Expected: `html ids ok`

## Task 3: Implement Platform Rendering JavaScript

**Files:**
- Modify: `site/app.js`

- [ ] **Step 1: Replace old single-account script**

Implement these responsibilities:

- Fetch `./data/content.json`.
- Store `items`, `sections`, `activeSection`, `activeSource`, and `query`.
- Render section cards from data.
- Render section/source filter buttons.
- Render content cards from filtered items.
- Open the reader dialog with source, section, summary, body, note, and source link.
- Support Escape key and backdrop close.
- Support reset filters.

Use these exact field names from `content.json`:

```js
const state = {
  items: [],
  sections: [],
  activeSection: "全部",
  activeSource: "全部",
  query: "",
};
```

Filtering rules:

```js
const matchesSection = state.activeSection === "全部" || item.section === state.activeSection;
const matchesSource = state.activeSource === "全部" || item.source === state.activeSource;
const haystack = [item.title, item.summary, item.body, item.source, item.section, ...(item.tags || [])]
  .join(" ")
  .toLowerCase();
const matchesQuery = haystack.includes(state.query.toLowerCase());
```

- [ ] **Step 2: Add robust text helpers**

Add helpers:

```js
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatBody(text) {
  return String(text || "")
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}
```

- [ ] **Step 3: Validate JavaScript syntax**

Run:

```bash
node --check site/app.js
```

Expected: no output and exit code 0.

## Task 4: Implement Modern Portal Styling

**Files:**
- Modify: `site/styles.css`

- [ ] **Step 1: Replace old sidebar/paper visual system**

Implement styles for:

- `:root` tokens with neutral base, dark ink, green section accent, blue section accent, subtle borders.
- Sticky top `site-header`.
- Responsive `hero` grid with platform copy and two section cards.
- `workbench` full-width band.
- `workbench-layout` two-column desktop and one-column mobile.
- Filter buttons, content cards, reader dialog.
- `.sr-only` accessibility utility.

Design constraints:

- Card border radius max 8px.
- No decorative gradient orbs.
- Text must wrap safely with `overflow-wrap: anywhere` where content may be long.
- Use multiple restrained hues, not a one-note palette.

- [ ] **Step 2: Validate CSS contains required selectors**

Run:

```bash
node -e "const css=require('fs').readFileSync('./site/styles.css','utf8'); for (const s of ['.site-header','.hero','.section-card','.workbench-layout','.filter-button','.article-grid','.reader-panel','@media']) { if (!css.includes(s)) throw new Error('missing '+s); } console.log('css selectors ok');"
```

Expected: `css selectors ok`

## Task 5: Local Browser Verification

**Files:**
- Verify: `site/index.html`
- Verify: `site/data/content.json`
- Verify: `site/app.js`
- Verify: `site/styles.css`

- [ ] **Step 1: Start local static server**

Run:

```bash
cd site && python3 -m http.server 8080
```

Expected: server prints `Serving HTTP on :: port 8080` or equivalent. If port 8080 is busy, use `8081`.

- [ ] **Step 2: Verify page loads in browser**

Open:

```text
http://localhost:8080
```

Expected:

- Header says `知行知识库`.
- Hero headline says `把行业观察整理成可检索、可复用的知识资产`.
- Both `产教融合` and `数字化转型` section cards are visible.
- Workbench shows content cards from both sources.

- [ ] **Step 3: Verify interactions**

Manual checks:

- Click `产教融合`; only “平哥聊职教” content remains.
- Click `数字化转型`; only “数字周参” content remains.
- Type `校企合作`; matching “平哥聊职教” cards remain.
- Type `治理确定性`; matching “数字周参” card remains.
- Click a card; reader opens.
- Press `Escape`; reader closes.
- Click `重置`; all content returns.

- [ ] **Step 4: Verify responsive layout**

Check desktop width and narrow mobile width. Expected:

- No overlapping text.
- Header navigation wraps or scrolls cleanly.
- Workbench filters move above cards on mobile.
- Cards remain readable in one column on mobile.

## Task 6: Final Checks

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run final syntax/data checks**

Run:

```bash
node --check site/app.js
node -e "JSON.parse(require('fs').readFileSync('./site/data/content.json','utf8')); console.log('json ok');"
```

Expected:

```text
json ok
```

- [ ] **Step 2: Confirm there is no git commit step**

Run:

```bash
git rev-parse --is-inside-work-tree
```

Expected: fails with `fatal: not a git repository`. Because this project is not a Git repository, do not run commit commands.

- [ ] **Step 3: Report completion**

Report:

- Files changed.
- Local URL used for verification.
- Any verification that could not be completed.

## Self-Review

- Spec coverage: The plan covers platform homepage structure, two launch sections, source assignment, search, section/source filters, detail reader, visual redesign, and responsive verification.
- Placeholder scan: No implementation step depends on fictional content. “数字周参” items come from real `site/data/ima_raw.json` titles and URLs.
- Type consistency: The plan consistently uses `section`, `sectionId`, `source`, `sourceType`, `contentType`, `summary`, `body`, `tags`, `url`, and `note`.

