const sectionCards = document.querySelector("#sectionCards");
const sectionFilters = document.querySelector("#sectionFilters");
const sourceFilters = document.querySelector("#sourceFilters");
const articleGrid = document.querySelector("#articleGrid");
const totalCount = document.querySelector("#totalCount");
const sectionCount = document.querySelector("#sectionCount");
const sourceCount = document.querySelector("#sourceCount");
const searchInput = document.querySelector("#searchInput");
const clearFilters = document.querySelector("#clearFilters");
const generatedAt = document.querySelector("#generatedAt");
const sourceNote = document.querySelector("#sourceNote");
const activeSummary = document.querySelector("#activeSummary");
const platformDescription = document.querySelector("#platformDescription");
const reader = document.querySelector("#reader");
const readerKicker = document.querySelector("#readerKicker");
const readerTitle = document.querySelector("#readerTitle");
const readerMeta = document.querySelector("#readerMeta");
const readerSummary = document.querySelector("#readerSummary");
const readerBody = document.querySelector("#readerBody");
const readerNote = document.querySelector("#readerNote");
const readerLink = document.querySelector("#readerLink");

const state = {
  items: [],
  sections: [],
  activeSection: "全部",
  activeSource: "全部",
  query: "",
};

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

function getSources() {
  return [...new Set(state.items.map((item) => item.source).filter(Boolean))];
}

function getFilteredItems() {
  return state.items.filter((item) => {
    const matchesSection = state.activeSection === "全部" || item.section === state.activeSection;
    const matchesSource = state.activeSource === "全部" || item.source === state.activeSource;
    const haystack = [item.title, item.summary, item.body, item.source, item.section, item.module, ...(item.tags || [])]
      .join(" ")
      .toLowerCase();
    const matchesQuery = haystack.includes(state.query.toLowerCase());
    return matchesSection && matchesSource && matchesQuery;
  });
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const left = String(a.publishedAt || "");
    const right = String(b.publishedAt || "");
    if (!left && !right) return a.title.localeCompare(b.title, "zh-Hans-CN");
    if (!left) return 1;
    if (!right) return -1;
    return right.localeCompare(left);
  });
}

function getPublishLabel(item) {
  const label = item.publishedLabel || item.publishedAt;
  if (label && /^\d{4}/.test(label)) return label;
  return "";
}

function getCardMeta(item) {
  const publishLabel = getPublishLabel(item);
  const parts = [item.source];
  if (publishLabel) parts.push(`发布时间：${publishLabel}`);
  if (item.duration) parts.push(item.duration);
  return parts.filter(Boolean).join(" · ");
}

function renderStats() {
  totalCount.textContent = state.items.length;
  sectionCount.textContent = state.sections.length;
  sourceCount.textContent = getSources().length;
}

function renderSectionCards() {
  sectionCards.innerHTML = state.sections
    .map((section, index) => {
      const count = state.items.filter((item) => item.section === section.name).length;
      return `
        <article id="${escapeHtml(section.id)}" class="section-card section-card--${escapeHtml(section.accent)}">
          <p class="section-index">板块 ${String(index + 1).padStart(2, "0")}</p>
          <h2>${escapeHtml(section.name)}</h2>
          <p>${escapeHtml(section.description)}</p>
          <div class="section-meta">
            <span>${escapeHtml(section.source)}</span>
            <strong>${count} 条</strong>
          </div>
          <button class="section-button" type="button" data-section="${escapeHtml(section.name)}">查看板块</button>
        </article>
      `;
    })
    .join("");
}

function renderFilterList(container, values, activeValue, dataKey) {
  const allButton = `
    <button class="filter-button ${activeValue === "全部" ? "is-active" : ""}" type="button" data-${dataKey}="全部">
      <span>全部</span>
      <strong>${state.items.length}</strong>
    </button>
  `;
  const buttons = values
    .map((value) => {
      const count = state.items.filter((item) => item[dataKey === "section" ? "section" : "source"] === value).length;
      return `
        <button class="filter-button ${activeValue === value ? "is-active" : ""}" type="button" data-${dataKey}="${escapeHtml(value)}">
          <span>${escapeHtml(value)}</span>
          <strong>${count}</strong>
        </button>
      `;
    })
    .join("");
  container.innerHTML = allButton + buttons;
}

function renderFilters() {
  renderFilterList(
    sectionFilters,
    state.sections.map((section) => section.name),
    state.activeSection,
    "section",
  );
  renderFilterList(sourceFilters, getSources(), state.activeSource, "source");
}

function renderSummary(filtered) {
  const parts = [];
  if (state.activeSection !== "全部") parts.push(`板块：${state.activeSection}`);
  if (state.activeSource !== "全部") parts.push(`来源：${state.activeSource}`);
  if (state.query) parts.push(`关键词：${state.query}`);
  const label = parts.length ? parts.join(" / ") : "全部内容";
  activeSummary.textContent = `${label} · ${filtered.length} 条结果`;
}

function renderCards() {
  const filtered = sortItems(getFilteredItems());
  renderSummary(filtered);

  if (!filtered.length) {
    articleGrid.innerHTML = `<div class="empty">没有匹配的内容。换个关键词或筛选条件试试。</div>`;
    return;
  }

  articleGrid.innerHTML = filtered
    .map((item) => {
      const chips = (item.tags || []).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
      const meta = getCardMeta(item);
      const moduleLabel = item.module ? `模块：${item.module}` : item.section;
      return `
        <article class="content-card">
          <div class="content-card-topline">
            <span>${escapeHtml(moduleLabel)}</span>
            <span>${escapeHtml(item.contentType === "video_digest" ? "视频精读" : "文章索引")}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta-line">${escapeHtml(meta)}</p>
          <p class="summary">${escapeHtml(item.summary)}</p>
          <div class="chips">${chips}</div>
          <button class="read-button" type="button" data-id="${escapeHtml(item.id)}">查看精读</button>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  renderStats();
  renderSectionCards();
  renderFilters();
  renderCards();
}

function openReader(item) {
  readerKicker.textContent = `${item.module || item.section} · ${item.source}`;
  readerTitle.textContent = item.title;
  const publishLabel = getPublishLabel(item);
  readerMeta.textContent = [publishLabel ? `发布时间：${publishLabel}` : "", item.contentType === "video_digest" ? "视频精读" : "文章索引", item.duration]
    .filter(Boolean)
    .join(" · ");
  readerSummary.textContent = item.summary || "";
  readerBody.innerHTML = formatBody(item.body);
  readerNote.textContent = item.note || "";
  readerLink.href = item.url || "#";
  readerLink.style.display = item.url ? "inline-flex" : "none";
  reader.classList.add("is-open");
  reader.setAttribute("aria-hidden", "false");
}

function closeReader() {
  reader.classList.remove("is-open");
  reader.setAttribute("aria-hidden", "true");
}

function setSection(sectionName) {
  state.activeSection = sectionName;
  state.activeSource = "全部";
  renderFilters();
  renderCards();
  document.querySelector("#workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetFilters() {
  state.activeSection = "全部";
  state.activeSource = "全部";
  state.query = "";
  searchInput.value = "";
  renderFilters();
  renderCards();
}

fetch("./data/content.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    state.sections = data.sections || [];
    state.items = data.items || [];
    platformDescription.textContent = data.platform?.description || "";
    generatedAt.textContent = `更新于 ${data.generatedAt || "本地"}`;
    sourceNote.textContent = data.sourceNote || "";
    renderAll();
  })
  .catch((error) => {
    articleGrid.innerHTML = `<div class="empty">数据加载失败：${escapeHtml(error.message)}</div>`;
  });

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderCards();
});

clearFilters.addEventListener("click", resetFilters);

sectionCards.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section]");
  if (!button) return;
  setSection(button.dataset.section);
});

sectionFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section]");
  if (!button) return;
  state.activeSection = button.dataset.section;
  renderFilters();
  renderCards();
});

sourceFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-source]");
  if (!button) return;
  state.activeSource = button.dataset.source;
  renderFilters();
  renderCards();
});

articleGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  const item = state.items.find((entry) => entry.id === button.dataset.id);
  if (item) openReader(item);
});

reader.addEventListener("click", (event) => {
  if (event.target.matches("[data-close]")) closeReader();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeReader();
});
