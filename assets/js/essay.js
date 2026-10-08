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
        return `<div class="stat-table cols-${block.headers.length}">${head}${rows}</div>`;
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

      const canonicalUrl = `https://renezou.com/essay?id=${essay.id}`;
      const shareTitle = `${essay.title} — Rene Zou`;
      const shareDesc = essay.dek || essay.teaser;

      document.title = shareTitle;
      document.getElementById("doc-title").textContent = shareTitle;
      document.getElementById("meta-desc").setAttribute("content", shareDesc);
      document.getElementById("canonical-link").setAttribute("href", canonicalUrl);
      document.getElementById("og-title").setAttribute("content", shareTitle);
      document.getElementById("og-desc").setAttribute("content", shareDesc);
      document.getElementById("og-url").setAttribute("content", canonicalUrl);
      document.getElementById("twitter-title").setAttribute("content", shareTitle);
      document.getElementById("twitter-desc").setAttribute("content", shareDesc);
      document.getElementById("crumb-category").textContent = essay.category;
      document.getElementById("essay-category").textContent = essay.category;
      document.getElementById("essay-title").textContent = essay.title;
      document.getElementById("essay-dek").textContent = essay.dek || essay.teaser;

      // Original publish date (YYYY-MM-DD). Parsed as UTC and formatted in
      // UTC so the calendar day never shifts with the reader's timezone.
      if (essay.publishedAt) {
        const pub = document.getElementById("essay-pub-date");
        const d = new Date(`${essay.publishedAt}T00:00:00Z`);
        pub.setAttribute("datetime", essay.publishedAt);
        pub.textContent = new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
        }).format(d);
        pub.hidden = false;
        document.getElementById("og-published").setAttribute("content", essay.publishedAt);
      }

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

      // Section list fixed at the left edge (shown on wide screens), plus
      // the reading-progress bar along the top of the window.
      const toc = document.getElementById("essay-toc");
      const headers = essay.body
        .map((b, idx) => (b.type === "h2" ? { idx, text: b.text } : null))
        .filter(Boolean);
      const bar = document.getElementById("read-progress");
      let links = [];
      let targets = [];
      if (headers.length) {
        toc.innerHTML = headers
          .map((h) => `<a href="#sec-${h.idx}"><span class="tick" aria-hidden="true"></span><span class="k">${h.text}</span></a>`)
          .join("");
        toc.classList.add("ready");
        links = Array.from(toc.querySelectorAll("a"));
        targets = headers.map((h) => document.getElementById(`sec-${h.idx}`));
      }
      const onScroll = () => {
        if (links.length) {
          let currentIdx = 0;
          targets.forEach((t, i) => {
            if (t && t.getBoundingClientRect().top < window.innerHeight * 0.35) currentIdx = i;
          });
          links.forEach((l, i) => l.classList.toggle("active", i === currentIdx));
        }
        if (bar) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
        }
      };
      document.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("essay-title").textContent = "Couldn't load this essay";
    });
})();
