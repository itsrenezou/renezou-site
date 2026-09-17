// ---------------------------------------------------------------
// Essay detail page: reads ?id= from the URL, loads the matching
// essay from content/essays.json, renders the body blocks, and
// builds a scrollspy table of contents from the h2 blocks.
// ---------------------------------------------------------------
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  function renderBlock(block, idx) {
    switch (block.type) {
      case "h2":
        return `<h2 id="sec-${idx}">${block.text}</h2>`;
      case "pull":
        return `<p class="pull">${block.text}</p>`;
      case "table": {
        const head = `<div class="stat-row">${block.headers.map((h) => `<div>${h}</div>`).join("")}</div>`;
        const rows = block.rows
          .map((r) => `<div class="stat-row">${r.map((c) => `<div>${c}</div>`).join("")}</div>`)
          .join("");
        return `<div class="stat-table">${head}${rows}</div>`;
      }
      case "p":
      default:
        return `<p>${block.text}</p>`;
    }
  }

  fetch("content/essays.json")
    .then((r) => r.json())
    .then((data) => {
      const essay = data.essays.find((e) => e.id === id);
      if (!essay) {
        document.getElementById("essay-title").textContent = "Essay not found";
        return;
      }

      document.title = `${essay.title} — Rene Zou`;
      document.getElementById("doc-title").textContent = `${essay.title} — Rene Zou`;
      document.getElementById("meta-desc").setAttribute("content", essay.dek || essay.teaser);
      document.getElementById("crumb-category").textContent = essay.category;
      document.getElementById("essay-category").textContent = essay.category;
      document.getElementById("essay-title").textContent = essay.title;
      document.getElementById("essay-dek").textContent = essay.dek || essay.teaser;

      const words = essay.wordCountTarget || 0;
      const minutes = Math.max(1, Math.round(words / 220));
      document.getElementById("essay-read-time").textContent = words ? `${minutes} min read` : "";

      if (!essay.hasDraft || !essay.body || !essay.body.length) {
        document.getElementById("essay-body").innerHTML = `
          <p class="pull">This one's still being written — check back soon, or catch it the moment it goes live via <a class="underline-link" href="index.html#in-transit">IN TRANSIT</a>.</p>
        `;
        return;
      }

      document.getElementById("essay-body").innerHTML = essay.body.map(renderBlock).join("");

      // Build TOC from h2 blocks
      const toc = document.getElementById("essay-toc");
      const headers = essay.body
        .map((b, idx) => (b.type === "h2" ? { idx, text: b.text } : null))
        .filter(Boolean);
      if (headers.length) {
        toc.innerHTML = headers.map((h) => `<a href="#sec-${h.idx}">${h.text}</a>`).join("");

        const links = Array.from(toc.querySelectorAll("a"));
        const targets = headers.map((h) => document.getElementById(`sec-${h.idx}`));
        const onScroll = () => {
          let currentIdx = 0;
          targets.forEach((t, i) => {
            if (t && t.getBoundingClientRect().top < 120) currentIdx = i;
          });
          links.forEach((l, i) => l.classList.toggle("active", i === currentIdx));
        };
        document.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      }
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("essay-title").textContent = "Couldn't load this essay";
    });
})();
