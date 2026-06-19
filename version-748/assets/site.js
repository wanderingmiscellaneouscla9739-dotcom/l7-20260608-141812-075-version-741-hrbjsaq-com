function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
}

ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var setActive = function (nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setActive(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                setActive((index + 1) % slides.length);
            }, 5600);
        }
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var textInput = scope.querySelector("[data-filter-text]");
        var yearSelect = scope.querySelector("[data-filter-year]");
        var typeSelect = scope.querySelector("[data-filter-type]");
        var list = scope.parentElement.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
        var apply = function () {
            var text = textInput ? textInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
                var textMatch = !text || title.indexOf(text) !== -1 || cardRegion.indexOf(text) !== -1 || cardCategory.indexOf(text) !== -1 || cardYear.indexOf(text) !== -1;
                var yearMatch = !year || cardYear === year;
                var typeMatch = !type || cardType === type;
                card.classList.toggle("is-hidden-by-filter", !(textMatch && yearMatch && typeMatch));
            });
        };
        [textInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });

    var globalInput = document.getElementById("globalSearchInput");
    var globalButton = document.getElementById("globalSearchButton");
    var resultGrid = document.getElementById("searchResultGrid");
    var resultInfo = document.getElementById("searchResultInfo");
    if (globalInput && resultGrid && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (initialQuery) {
            globalInput.value = initialQuery;
        }
        var render = function () {
            var query = globalInput.value.trim().toLowerCase();
            var source = window.MOVIE_SEARCH_INDEX;
            var results = source.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return movie.search.indexOf(query) !== -1;
            }).slice(0, 120);
            resultInfo.textContent = query ? "找到 " + results.length + " 条相关结果" : "推荐影片";
            resultGrid.innerHTML = results.map(function (movie) {
                return '<article class="movie-card movie-card-compact" data-title="' + escapeHtml(movie.title) + '">' +
                    '<a class="movie-cover" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
                    '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="cover-shade"></span><span class="play-chip">播放</span></a>' +
                    '<div class="movie-card-body"><div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.description) + '</p>' +
                    '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div></div></article>';
            }).join("");
        };
        if (globalButton) {
            globalButton.addEventListener("click", render);
        }
        globalInput.addEventListener("input", render);
        if (initialQuery) {
            render();
        }
    }
});

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initMoviePlayer(videoId, streamUrl, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
        return;
    }
    var hlsInstance = null;
    var attachStream = function () {
        if (video.getAttribute("data-ready") !== "1") {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.setAttribute("data-ready", "1");
        }
        button.classList.add("is-hidden");
        video.controls = true;
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
        }
    };
    button.addEventListener("click", attachStream);
    video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "1") {
            attachStream();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
