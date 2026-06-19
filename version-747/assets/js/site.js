(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                var isHidden = mobileNav.hasAttribute('hidden');
                if (isHidden) {
                    mobileNav.removeAttribute('hidden');
                    document.body.classList.add('menu-open');
                    menuButton.setAttribute('aria-expanded', 'true');
                } else {
                    mobileNav.setAttribute('hidden', '');
                    document.body.classList.remove('menu-open');
                    menuButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

        var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var activeHero = 0;

        function showHero(index) {
            if (!heroSlides.length) {
                return;
            }
            activeHero = (index + heroSlides.length) % heroSlides.length;
            heroSlides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeHero);
            });
            heroDots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeHero);
            });
        }

        heroDots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
            });
        });

        if (heroSlides.length > 1) {
            setInterval(function () {
                showHero(activeHero + 1);
            }, 5600);
        }

        var query = new URLSearchParams(window.location.search).get('search') || '';
        var librarySearch = document.getElementById('librarySearch');
        var yearSelect = document.getElementById('yearSelect');
        var typeSelect = document.getElementById('typeSelect');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-item'));
        var activeCategory = '';

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                if (!value) {
                    return;
                }
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        if (cards.length) {
            var years = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-year') || '';
            }).filter(Boolean))).sort(function (a, b) {
                return Number(b) - Number(a);
            });
            var types = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute('data-type') || '';
            }).filter(Boolean))).sort();
            fillSelect(yearSelect, years);
            fillSelect(typeSelect, types);
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }
            var text = normalize(librarySearch ? librarySearch.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var passText = !text || haystack.indexOf(text) !== -1;
                var passYear = !year || card.getAttribute('data-year') === year;
                var passType = !type || card.getAttribute('data-type') === type;
                var passCategory = !activeCategory || card.getAttribute('data-category') === activeCategory;
                var show = passText && passYear && passType && passCategory;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            var emptyState = document.querySelector('.empty-state');
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (librarySearch) {
            librarySearch.value = query;
            librarySearch.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', filterCards);
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]')).forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-category') || '';
                Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]')).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                filterCards();
            });
        });

        filterCards();
    });
})();
