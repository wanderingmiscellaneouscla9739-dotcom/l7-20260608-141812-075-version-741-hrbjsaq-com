(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                event.preventDefault();
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards(scope, keyword, year, region) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-card"));
        var visible = 0;
        var normalizedKeyword = normalize(keyword);
        var normalizedYear = normalize(year);
        var normalizedRegion = normalize(region);
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var matched = true;
            if (normalizedKeyword && haystack.indexOf(normalizedKeyword) === -1) {
                matched = false;
            }
            if (normalizedYear && cardYear !== normalizedYear) {
                matched = false;
            }
            if (normalizedRegion && cardRegion.indexOf(normalizedRegion) === -1) {
                matched = false;
            }
            card.classList.toggle("hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });
        var empty = scope.querySelector("[data-empty-result]");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var keywordInput = scope.querySelector("[data-filter-keyword]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            function apply() {
                filterCards(
                    scope,
                    keywordInput ? keywordInput.value : "",
                    yearSelect ? yearSelect.value : "",
                    regionSelect ? regionSelect.value : ""
                );
            }
            [keywordInput, yearSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
        var searchScope = document.querySelector("[data-search-scope]");
        if (searchScope) {
            var pageInput = searchScope.querySelector("[data-page-search]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (pageInput) {
                pageInput.value = query;
                pageInput.addEventListener("input", function () {
                    filterCards(searchScope, pageInput.value, "", "");
                });
            }
            filterCards(searchScope, query, "", "");
        }
    }

    ready(function () {
        setupMenu();
        setupHeaderSearch();
        setupHero();
        setupFilters();
    });
})();
