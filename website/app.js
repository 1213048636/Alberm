/**
 * Album Cover Gallery
 * Loads manifest.json, renders grid, handles filter + lightbox + keyboard nav
 */

(function () {
  "use strict";

  // ─── State ───────────────────────────────────────────────────────────────
  let manifest = [];   // full list from manifest.json
  let filtered = [];   // currently displayed indices
  let currentIndex = 0; // lightbox position in filtered list

  // ─── DOM refs ───────────────────────────────────────────────────────────
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");

  // ─── Init ────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const resp = await fetch("manifest.json");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      manifest = await resp.json();
    } catch (err) {
      gallery.innerHTML =
        '<p style="text-align:center;color:#888;padding:2rem">Failed to load gallery data. Please run via a local server or GitHub Pages.</p>';
      console.error("manifest.json load error:", err);
      return;
    }

    // All images shown by default
    filtered = manifest.map((_, i) => i);
    renderGallery();
    setupIntersectionObserver();
    setupEventListeners();
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  function renderGallery() {
    gallery.innerHTML = "";

    filtered.forEach((origIndex) => {
      const entry = manifest[origIndex];
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `${entry.style} - ${entry.filename}`);
      item.dataset.index = origIndex;
      item.dataset.style = entry.style;

      const img = document.createElement("img");
      img.src = entry.thumbPath;
      img.alt = `${entry.style} album cover`;
      img.loading = "lazy";
      img.decoding = "async";

      item.appendChild(img);
      gallery.appendChild(item);
    });
  }

  // ─── Intersection Observer (fade-in) ─────────────────────────────────
  let observer;

  function setupIntersectionObserver() {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
  }

  function observeItems() {
    document.querySelectorAll(".gallery-item").forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── Filter ─────────────────────────────────────────────────────────────
  function setFilter(style) {
    filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === style);
    });

    if (style === "all") {
      filtered = manifest.map((_, i) => i);
    } else {
      filtered = manifest
        .map((_, i) => i)
        .filter((i) => manifest[i].style === style);
    }

    renderGallery();
    observeItems();

    // Close lightbox if current image not in new filtered set
    if (!lightbox.hidden) {
      const currentOrigIndex = parseInt(lightboxImg.dataset.origIndex, 10);
      if (!filtered.includes(currentOrigIndex)) closeLightbox();
    }
  }

  // ─── Lightbox ───────────────────────────────────────────────────────────
  function openLightbox(origIndex) {
    currentIndex = filtered.indexOf(origIndex);
    const entry = manifest[origIndex];

    lightboxImg.src = entry.thumbPath;
    lightboxImg.dataset.origIndex = origIndex;
    lightboxImg.alt = `${entry.style} - ${entry.filename}`;

    updateCounter();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function updateCounter() {
    // Counter shows position in filtered set and total filtered count
    lightboxCounter.textContent = `${currentIndex + 1} / ${filtered.length}`;
  }

  // Navigate through filtered set only
  function navigateLightbox(direction) {
    currentIndex =
      (currentIndex + direction + filtered.length) % filtered.length;
    const origIndex = filtered[currentIndex];
    const entry = manifest[origIndex];

    lightboxImg.src = entry.thumbPath;
    lightboxImg.dataset.origIndex = origIndex;
    lightboxImg.alt = `${entry.style} - ${entry.filename}`;

    updateCounter();
  }

  // ─── Event Listeners ────────────────────────────────────────────────────
  function setupEventListeners() {
    // Filter buttons
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => setFilter(btn.dataset.filter));
    });

    // Gallery item clicks
    gallery.addEventListener("click", (e) => {
      const item = e.target.closest(".gallery-item");
      if (!item) return;
      openLightbox(parseInt(item.dataset.index, 10));
    });

    // Gallery item keyboard (Enter / Space)
    gallery.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const item = e.target.closest(".gallery-item");
        if (!item) return;
        e.preventDefault();
        openLightbox(parseInt(item.dataset.index, 10));
      }
    });

    // Lightbox close
    closeBtn.addEventListener("click", closeLightbox);

    // Lightbox nav
    prevBtn.addEventListener("click", () => navigateLightbox(-1));
    nextBtn.addEventListener("click", () => navigateLightbox(1));

    // Click backdrop to close
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    });
  }

  // ─── Start ──────────────────────────────────────────────────────────────
  init();
})();