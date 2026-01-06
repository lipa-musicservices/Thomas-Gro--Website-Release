// Fixedpages/include.js
(function () {
  // Base-URL = Ordner von include.js (also /Fixedpages/)
  const scriptUrl = document.currentScript?.src || "";
  const base = new URL("./", scriptUrl || window.location.href);

  async function loadFragment(name) {
  const fileMap = {
    headbar: "Headbar.html",
    footbar: "Footbar.html",
  };

  const file = fileMap[name] || `${name}.html`;
  const url = new URL(file, base).toString();

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Include "${name}" failed: ${res.status} ${res.statusText} (${url})`);
  return await res.text();
}

  async function boot() {
    const slots = Array.from(document.querySelectorAll("[data-include]"));

    for (const slot of slots) {
      const name = (slot.getAttribute("data-include") || "").trim();
      if (!name) continue;

      try {
        slot.innerHTML = await loadFragment(name);
      } catch (err) {
        console.error(err);
        slot.innerHTML = `<!-- include failed: ${name} -->`;
      }
    }

    // Event: "Includes sind da"
    document.dispatchEvent(new CustomEvent("includes:ready"));
  }

  // sofort starten
  boot();
})();

function bindHeadbarOnce() {
  // Doppelt-Binding verhindern
  if (window.__HEADBAR_BOUND__) return;
  window.__HEADBAR_BOUND__ = true;

  // 1) Burger toggle (delegiert)
  document.addEventListener("click", (e) => {
    const burger = e.target.closest("[data-burger]");
    if (!burger) return;

    e.preventDefault();

    const nav = document.querySelector("[data-nav]");
    if (!nav) return;

    const willOpen = !nav.classList.contains("nav--open");
    nav.classList.toggle("nav--open", willOpen);
    burger.setAttribute("aria-expanded", String(willOpen));
    document.body.classList.toggle("noScroll", willOpen);
  }, true);

  // 2) Klick außerhalb schließt
  document.addEventListener("click", (e) => {
    const nav = document.querySelector("[data-nav]");
    const burger = document.querySelector("[data-burger]");
    if (!nav || !burger) return;
    if (!nav.classList.contains("nav--open")) return;

    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove("nav--open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("noScroll");
    }
  });

  // 3) ESC schließt
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const nav = document.querySelector("[data-nav]");
    const burger = document.querySelector("[data-burger]");
    if (!nav || !burger) return;

    nav.classList.remove("nav--open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("noScroll");
  });
}
