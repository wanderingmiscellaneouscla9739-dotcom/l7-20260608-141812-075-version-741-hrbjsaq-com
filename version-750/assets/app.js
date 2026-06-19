(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
    var kindFilters = Array.prototype.slice.call(document.querySelectorAll('[data-kind-filter]'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInputs.map(function (input) { return input.value; }).join(' '));
        var kind = normalize(kindFilters.find(function (select) { return select.value; }) ? kindFilters.find(function (select) { return select.value; }).value : '');
        var year = normalize(yearFilters.find(function (select) { return select.value; }) ? yearFilters.find(function (select) { return select.value; }).value : '');
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardKind = normalize(card.getAttribute('data-kind'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (kind && cardKind.indexOf(kind) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.classList.toggle('hidden-by-filter', !matched);
            if (matched) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    searchInputs.concat(kindFilters).concat(yearFilters).forEach(function (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
    });

    window.setupMoviePlayer = function (videoUrl) {
        var video = document.getElementById('movieVideo');
        var overlay = document.querySelector('.player-overlay');
        var button = document.querySelector('.play-button');
        var hlsInstance = null;
        var attached = false;

        if (!video || !videoUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }
            video.src = videoUrl;
            attached = true;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
