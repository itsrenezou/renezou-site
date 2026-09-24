// ---------------------------------------------------------------
// Writing index: loads content/essays.json, renders the featured
// box, category filters (real client-side filtering), and the
// essay list. Cards for essays without a full draft yet render
// with their status tag but are not clickable.
// ---------------------------------------------------------------
(function () {
  const CATEGORIES = [
    "All",
    "Strategy",
    "Entrepreneurship",
    "Building",
    "Knowledge",
    "Capital",
    "Networks",
    "Archives",
  ];

  const STATUS_LABEL = { live: "pinned", progress: "live" };

  function statusTag(status) {
    // The "live" pill (status:"progress" in the JSON, styled lavender via
    // .tag.status-progress) is retired — only the "pinned" pill still shows.
    const label = STATUS_LABEL[status];
    if (label === "live") return "";
    return `<span class="tag status-${status === "live" ? "live" : "progress"}">${label}</span>`;
  }

  function essayMeta(e) {
    const bits = [e.type, e.date].filter(Boolean);
    if (!bits.length) return "";
    return `<span class="essay-meta">${bits.join(" \u00b7 ")}</span>`;
  }

  function essayCard(e) {
    const inner = `
      <div class="essay-card-top">
        ${statusTag(e.status)}
        <span class="tag category">${e.category}</span>
        ${essayMeta(e)}
      </div>
      <h3><span class="title-chevron" aria-hidden="true">&gt;</span>${e.title}</h3>
      <p>${e.teaser}</p>
    `;
    if (e.hasDraft) {
      return `<a class="essay-card pub-card pub-card--published" href="essay.html?id=${e.id}">${inner}</a>`;
    }
    return `<div class="essay-card locked pub-card pub-card--progress">${inner}</div>`;
  }

  fetch("content/essays.json")
    .then((r) => r.json())
    .then((data) => {
      // Newest first by date. Dates are month-precision (YYYY-MM), so string
      // comparison sorts correctly, and 'order' breaks ties within a month.
      // Entries with no date fall to the bottom rather than the top.
      const essays = data.essays.slice().sort((a, b) => {
        const byDate = (b.date || "").localeCompare(a.date || "");
        return byDate !== 0 ? byDate : a.order - b.order;
      });

      const countBadge = document.getElementById("essay-count-badge");
      if (countBadge) {
        const year = new Date().getFullYear();
        countBadge.textContent = `${essays.length} ${essays.length === 1 ? "essay" : "essays"} · ${year}`;
      }

      // Featured: the essays that are live
      const live = essays.filter((e) => e.status === "live");
      const box = document.getElementById("featured-box");
      const grid = document.getElementById("featured-grid");
      const title = document.getElementById("featured-title");
      if (live.length) {
        box.hidden = false;
        title.textContent = live.length === 1 ? "If you only read one" : `If you only read ${live.length === 2 ? "two" : live.length}`;
        grid.innerHTML = live
          .map(
            (e) => `
          <div class="fb-card">
            ${e.hasDraft ? `<a href="essay.html?id=${e.id}" class="underline-link">` : ""}
            <h3>${e.title}</h3>
            ${e.hasDraft ? `</a>` : ""}
            <p>${e.teaser}</p>
          </div>`
          )
          .join("");
      }

      // Filters
      const filtersEl = document.getElementById("filters");
      let active = "All";

      // The index line above the list — year, label, rule, and a count that
      // tracks the active filter rather than the full archive.
      function renderIndexLine(count) {
        const el = document.getElementById("list-index");
        if (!el) return;
        el.innerHTML = `
          <span class="li-year">${new Date().getFullYear()}</span>
          <span class="li-label">· current issues</span>
          <span class="li-rule"></span>
          <span class="li-count">${count}</span>
        `;
      }

      // Publication cadence: essays without a draft yet ("in the works")
      // render as smaller grey cards above; essays with a draft ("published")
      // render as larger white cards below — same essayCard() markup, just
      // grouped by hasDraft instead of listed flat.
      function pubGroup(label, items, gridClass, groupClass) {
        if (!items.length) return "";
        return `
          <div class="pub-group ${groupClass}">
            <div class="pub-group-head">
              <span class="pub-group-label">${label}</span>
              <span class="pub-group-count">${items.length} ${items.length === 1 ? "essay" : "essays"}</span>
            </div>
            <div class="pub-grid ${gridClass}">${items.map(essayCard).join("")}</div>
          </div>
        `;
      }

      function renderList() {
        const list = document.getElementById("essay-list");
        const outro = document.getElementById("list-outro");
        const filtered = active === "All" ? essays : essays.filter((e) => e.category === active);
        renderIndexLine(filtered.length);
        if (!filtered.length) {
          list.innerHTML = `<p style="color:var(--muted); font-size:13.5px; padding:24px 4px; border-top:1px solid var(--border);">No essays in “${active}” yet.</p>`;
          if (outro) outro.hidden = true;
          return;
        }
        const inProgress = filtered.filter((e) => !e.hasDraft);
        const published = filtered.filter((e) => e.hasDraft);
        list.innerHTML = `
          <div class="pub-groups">
            ${pubGroup("In the works", inProgress, "pub-grid--progress", "pub-group--progress")}
            ${pubGroup("Published", published, "pub-grid--published", "pub-group--published")}
          </div>
        `;
        if (outro) outro.hidden = false;
      }

      function renderFilters() {
        filtersEl.innerHTML = CATEGORIES.map(
          (c) => `<button type="button" data-cat="${c}" class="${c === active ? "active" : ""}">${c}</button>`
        ).join("");
      }

      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-cat]");
        if (!btn) return;
        active = btn.dataset.cat;
        renderFilters();
        renderList();
      });

      renderFilters();
      renderList();
    })
    .catch((err) => {
      console.error("Could not load essays.json", err);
      const list = document.getElementById("essay-list");
      if (list) list.innerHTML = `<p style="color:var(--muted)">Couldn't load essays right now.</p>`;
    });
})();
