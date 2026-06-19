(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navigation = document.querySelector('[data-site-nav]');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function() {
            navigation.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === activeIndex);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === activeIndex);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('.js-filter-input');
    var sortSelect = document.querySelector('.js-sort-select');
    var grid = document.querySelector('[data-card-grid]');
    var emptyState = document.querySelector('[data-empty-state]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var selectedCategory = 'all';

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.textContent
        ].join(' '));
    }

    function applyFilter() {
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children).filter(function(card) {
            return card.matches('.movie-card, .rank-card');
        });
        var query = normalize(filterInput ? filterInput.value : '');
        var visible = 0;

        cards.forEach(function(card) {
            var category = card.getAttribute('data-category') || '';
            var matchCategory = selectedCategory === 'all' || category === selectedCategory;
            var matchQuery = !query || cardText(card).indexOf(query) !== -1;
            var show = matchCategory && matchQuery;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('active', visible === 0);
        }
    }

    function applySort() {
        if (!grid || !sortSelect) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children).filter(function(card) {
            return card.matches('.movie-card, .rank-card');
        });
        var mode = sortSelect.value;

        cards.sort(function(a, b) {
            if (mode === 'year') {
                return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
            }
            if (mode === 'title') {
                return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
            }
            return 0;
        });

        cards.forEach(function(card) {
            grid.appendChild(card);
        });
        applyFilter();
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            filterInput.value = query;
        }
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            selectedCategory = button.getAttribute('data-filter-category') || 'all';
            filterButtons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    });

    applyFilter();
})();

function initMoviePlayer(playUrl) {
    var video = document.getElementById('movie-player');
    var startButton = document.getElementById('player-start');
    var attached = false;

    if (!video || !playUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(playUrl);
            hls.attachMedia(video);
        } else {
            video.src = playUrl;
        }
    }

    function start() {
        attach();
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', start);
    }

    video.addEventListener('click', function() {
        if (!attached || video.paused) {
            start();
        }
    });

    video.addEventListener('play', function() {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    });
}
