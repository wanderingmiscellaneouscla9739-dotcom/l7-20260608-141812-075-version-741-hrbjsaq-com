(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var region = scope.querySelector("[data-region-filter]");
        var year = scope.querySelector("[data-year-filter]");
        var sort = scope.querySelector("[data-sort-select]");
        var grid = scope.parentElement.querySelector("[data-card-grid]");

        if (!grid) {
            grid = document.querySelector("[data-card-grid]");
        }

        function apply() {
            if (!grid) {
                return;
            }

            var query = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? Number(year.value) : 0;
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));

            cards.forEach(function (card) {
                var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = Number(card.getAttribute("data-year") || 0);
                var matchesQuery = !query || searchText.indexOf(query) !== -1;
                var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1 || searchText.indexOf(regionValue.toLowerCase()) !== -1;
                var matchesYear = !yearValue || cardYear >= yearValue;
                card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesRegion && matchesYear));
            });

            if (sort) {
                var sortValue = sort.value;
                cards.sort(function (a, b) {
                    if (sortValue === "title") {
                        return (a.getAttribute("data-search") || "").localeCompare(b.getAttribute("data-search") || "", "zh-Hans-CN");
                    }
                    if (sortValue === "year") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        }

        [input, region, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });

    document.querySelectorAll("video[data-stream]").forEach(function (video) {
        var stream = video.getAttribute("data-stream");
        if (!stream) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        }
    });

    document.querySelectorAll("[data-video-play]").forEach(function (button) {
        button.addEventListener("click", function () {
            var id = button.getAttribute("data-video-play");
            var video = document.getElementById(id);
            if (video) {
                video.play().catch(function () {});
            }
        });
    });
})();
