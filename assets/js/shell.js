// ---------------------------------------------------------------
// Renders the persistent sidebar (identity, nav, meta, newsletter,
// command palette trigger) on every page, wires the command palette,
// and the live local-time widget.
// ---------------------------------------------------------------
(function () {
  const CFG = window.SITE_CONFIG;
  const path = location.pathname.split("/").pop() || "index.html";

  const NAV = [
    { href: "index.html", label: "Writing", sub: "5" },
    { href: "stack.html", label: "Stack", sub: "how I build" },
    { href: "investing.html", label: "Investing", sub: "views" },
  ];

  function navHtml() {
    return NAV.map((item) => {
      const active = path === item.href ? " active" : "";
      return `<a class="nav-link${active}" href="${item.href}">${item.label}${
        item.sub ? `<span class="sub">${item.sub}</span>` : ""
      }</a>`;
    }).join("");
  }

  // Small inline arrow icon used for outbound social/contact links.
  const arrowIcon = `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const substackForm = CFG.substackPublication
    ? `<form id="transit-form" action="https://${CFG.substackPublication}.substack.com/api/v1/free" method="post" target="_blank" rel="noopener">
         <input type="email" name="email" placeholder="you@company.com" aria-label="Email address" required />
         <button type="submit">Send it →</button>
       </form>
       <div class="nl-note">Delivered via Substack.</div>`
    : `<div class="nl-note">Signup opens once the Substack publication is live.</div>`;

  const sidebarHtml = `
    <img class="avatar" src="assets/img/avatar.jpg" alt="${CFG.name}" />
    <div>
      <div class="identity-name">${CFG.name}</div>
      <div class="identity-lines">
        <div><span class="label">Founder</span><a class="underline-link" href="work.html">Eklipse</a> · systems for founders</div>
        <div><span class="label">Category</span>strategic infrastructure</div>
        <div><span class="label">Investor</span>pre-seed, deep tech</div>
      </div>
    </div>

    <div class="bio-wrap">
      <p class="bio">I write about how geography shapes the production, accumulation, and <strong>movement of capital</strong> in the AI era — and with <strong>Eklipse</strong>, I build on that thesis directly. Eklipse is strategic infrastructure for ambitious founders: it builds scalable systems that turn founders' vision into strategy, and strategy into execution. Alongside that, I track health tech, biotech, industrial tech, infrastructure, and enterprise SaaS — turning a love of <strong>deep tech</strong> into an investing lens of my own.</p>
    </div>

    <nav class="primary-nav">${navHtml()}</nav>

    <div class="meta-block">
      <div class="building-badge"><span class="pulse"></span> Currently building <a class="underline-link" href="${CFG.eklipseUrl}" target="_blank" rel="noopener">EKLIPSE ↗</a></div>
      <div class="meta-row"><span class="k">local</span><span class="v" id="local-clock">—</span></div>
      <div class="meta-row"><span class="k">based</span><span class="v">${CFG.basedCity}</span></div>
      <div class="meta-row"><span class="k">orbit</span><span class="v">${CFG.orbit}</span></div>
      <div class="meta-row"><span class="k">grown</span><span class="v">${CFG.grown}</span></div>
    </div>

    <div class="social-row">
      <a href="${CFG.eklipseUrl}" target="_blank" rel="noopener"><span>Eklipse</span>${arrowIcon}</a>
      <a href="${CFG.xUrl}" target="_blank" rel="noopener"><span>X</span>${arrowIcon}</a>
      <a href="${CFG.instagramUrl}" target="_blank" rel="noopener"><span>Instagram</span>${arrowIcon}</a>
      <a href="${CFG.linkedinUrl}" target="_blank" rel="noopener"><span>LinkedIn</span>${arrowIcon}</a>
      <a href="mailto:${CFG.email}"><span>Email</span>${arrowIcon}</a>
    </div>

    <div class="newsletter">
      <div class="nl-title">IN TRANSIT</div>
      <div class="nl-blurb">The ideas that move with capital, people, and technology — sent only when it's worth tracking.</div>
      ${substackForm}
    </div>

    <button class="cmdk-trigger" id="cmdk-open" type="button">
      <span>Jump to anything</span>
      <kbd>⌘K</kbd>
    </button>
  `;

  const mount = document.getElementById("sidebar-mount");
  if (mount) mount.innerHTML = sidebarHtml;

  // Bio hover glow — tracks the cursor across the ENTIRE page (not just
  // while it's directly over the sidebar), and projects that position onto
  // the bio paragraph's own coordinate space via --mx/--my. The CSS radial
  // gradient's falloff does the rest: the glow brightens as the cursor
  // approaches the bio from anywhere on the page and fades as it moves away,
  // instead of snapping on/off at the sidebar's edge.
  const bioWrap = document.querySelector(".bio-wrap");
  if (bioWrap) {
    document.addEventListener("mousemove", (e) => {
      const rect = bioWrap.getBoundingClientRect();
      bioWrap.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      bioWrap.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  }

  // live clock
  function tick() {
    const el = document.getElementById("local-clock");
    if (!el) return;
    try {
      const fmt = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: CFG.basedTimezone,
      });
      el.textContent = fmt.format(new Date());
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString();
    }
  }
  tick();
  setInterval(tick, 30000);

  // ---- command palette (styled shortcut + nav jump, not full search) ----
  const DESTINATIONS = [
    { label: "Writing", sub: "what I think", href: "index.html" },
    { label: "Work & Track Record", sub: "who I am", href: "work.html" },
    { label: "Stack", sub: "what I build", href: "stack.html" },
    { label: "Investing", sub: "what I back", href: "investing.html" },
  ];

  const overlay = document.createElement("div");
  overlay.className = "cmdk-overlay";
  overlay.id = "cmdk-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="cmdk-panel" role="dialog" aria-label="Jump to anything">
      <div class="cmdk-input-row">
        <span>Jump to anything</span>
      </div>
      <div class="cmdk-list">
        ${DESTINATIONS.map(
          (d) => `<a href="${d.href}"><span>${d.label}</span><span class="sub">${d.sub}</span></a>`
        ).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function openCmdk() {
    overlay.hidden = false;
  }
  function closeCmdk() {
    overlay.hidden = true;
  }

  document.addEventListener("click", (e) => {
    if (e.target.id === "cmdk-open" || e.target.closest("#cmdk-open") || e.target.closest(".search-trigger")) {
      openCmdk();
    }
    if (e.target === overlay) closeCmdk();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.hidden ? openCmdk() : closeCmdk();
    }
    if (e.key === "Escape") closeCmdk();
  });

  // Google Analytics (loads only if a measurement ID is configured)
  if (CFG.gaMeasurementId) {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${CFG.gaMeasurementId}`;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", CFG.gaMeasurementId);
  }
})();
