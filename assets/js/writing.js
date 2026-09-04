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

  const STATUS_LABEL = { live: "live", progress: "in progress" };

  function statusTag(status) {
    return `<span class="tag status-${status === "live" ? "live" : "progress"}">${STATUS_LABEL[status]}</span>`;
  }

  function essayCard(e) {
    const inner = `
      <div class="essay-card-top">
        ${statusTag(e.status)}
        <span class="tag category">${e.category}</span>
      </div>
      <h3>${e.title}</h3>
      <p>${e.teaser}</p>
    `;
    if (e.hasDraft) {
      return `<a class="essay-card" href="essay.html?id=${e.id}">${inner}</a>`;
    }
    return `<div class="essay-card locked">${inner}</div>`;
  }

  fetch("content/essays.json")
    .then((r) => r.json())
    .then((data) => {
      const essays = data.essays.slice().sort((a, b) => a.order - b.order);

      const countLine = document.getElementById("essay-count-line");
      if (countLine) {
        countLine.textContent = `Ideas on how capital, technology and people move — and what moves with them. ${essays.length} essays.`;
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

      function renderList() {
        const list = document.getElementById("essay-list");
        const filtered = active === "All" ? essays : essays.filter((e) => e.category === active);
        if (!filtered.length) {
          list.innerHTML = `<p style="color:var(--muted); font-size:13.5px; padding:24px 4px; border-top:1px solid var(--border);">No essays in “${active}” yet.</p>`;
          return;
        }
        list.innerHTML = filtered.map(essayCard).join("");
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
