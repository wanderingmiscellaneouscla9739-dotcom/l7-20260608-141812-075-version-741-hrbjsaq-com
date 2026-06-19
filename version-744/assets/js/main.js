(function () {
  function initMobileNav() {
    const button = document.querySelector(".mobile-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    start();
  }

  function initFilters() {
    const sections = Array.from(document.querySelectorAll(".search-section"));
    sections.forEach(function (section) {
      const input = section.querySelector(".site-search");
      const year = section.querySelector(".year-filter");
      const type = section.querySelector(".type-filter");
      const items = Array.from(section.querySelectorAll(".movie-item"));
      if (!input && !year && !type) {
        return;
      }
      function apply() {
        const keyword = input ? input.value.trim().toLowerCase() : "";
        const yearValue = year ? year.value : "";
        const typeValue = type ? type.value : "";
        items.forEach(function (item) {
          const text = [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year"),
            item.getAttribute("data-type"),
            item.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          const matchesYear = !yearValue || item.getAttribute("data-year") === yearValue;
          const matchesType = !typeValue || item.getAttribute("data-type") === typeValue;
          item.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType));
        });
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
