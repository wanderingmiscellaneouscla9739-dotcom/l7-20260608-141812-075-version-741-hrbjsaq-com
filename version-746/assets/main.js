(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.concat(thumbs).forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-hero-dot') || button.getAttribute('data-hero-thumb');
        show(Number(value || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-category-filter]').forEach(function (toolbar) {
    var input = toolbar.querySelector('[data-filter-keyword]');
    var year = toolbar.querySelector('[data-filter-year]');
    var type = toolbar.querySelector('[data-filter-type]');
    var sort = toolbar.querySelector('[data-filter-sort]');
    var grid = document.querySelector('[data-filter-grid]');
    var empty = document.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function apply() {
      var keyword = (input && input.value || '').trim().toLowerCase();
      var yearValue = year && year.value || '';
      var typeValue = type && type.value || '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    function applySort() {
      var sortValue = sort && sort.value || 'default';
      var sorted = cards.slice();

      if (sortValue === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      } else if (sortValue === 'heat') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('href').replace(/\D/g, '')) - Number(b.getAttribute('href').replace(/\D/g, ''));
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    if (sort) {
      sort.addEventListener('change', applySort);
    }
    apply();
  });

  document.querySelectorAll('[data-player-stage]').forEach(function (stage) {
    var video = stage.querySelector('.movie-video');
    var button = stage.querySelector('[data-play-button]');
    var message = stage.querySelector('[data-player-message]');
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function prepare() {
      var stream = video.getAttribute('data-stream') || '';
      if (!stream) {
        setMessage('播放暂不可用，请稍后再试');
        return false;
      }
      if (video.getAttribute('data-ready') === '1') {
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放连接异常，请刷新重试');
            try {
              hlsInstance.destroy();
            } catch (error) {}
            hlsInstance = null;
            video.removeAttribute('data-ready');
          }
        });
        video.setAttribute('data-ready', '1');
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.setAttribute('data-ready', '1');
        return true;
      }
      setMessage('此设备暂无法播放该视频');
      return false;
    }

    function play() {
      setMessage('');
      if (!prepare()) {
        return;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setMessage('点击视频控件继续播放');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_DATA) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var typeSelect = searchPage.querySelector('[data-search-type]');
    var yearSelect = searchPage.querySelector('[data-search-year]');
    var results = searchPage.querySelector('[data-search-results]');
    var fallback = searchPage.querySelector('[data-search-fallback]');
    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get('q') || '';
    }
    if (typeSelect && params.get('type')) {
      typeSelect.value = params.get('type') || '';
    }
    if (yearSelect && params.get('year')) {
      yearSelect.value = params.get('year') || '';
    }

    function createCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + movie.url + '">' +
        '<div class="movie-card__poster"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="movie-card__play">▶</span></div>' +
        '<div class="movie-card__body"><div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function renderSearch() {
      var keyword = (input && input.value || '').trim().toLowerCase();
      var typeValue = typeSelect && typeSelect.value || '';
      var yearValue = yearSelect && yearSelect.value || '';
      var active = Boolean(keyword || typeValue || yearValue);

      if (!active) {
        if (results) {
          results.innerHTML = '';
        }
        if (fallback) {
          fallback.hidden = false;
        }
        return;
      }

      var matched = window.SEARCH_DATA.filter(function (movie) {
        var haystack = (movie.search || '').toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (yearValue && movie.year !== yearValue) {
          return false;
        }
        return true;
      }).slice(0, 160);

      if (fallback) {
        fallback.hidden = true;
      }
      if (results) {
        results.innerHTML = matched.length ? matched.map(createCard).join('') : '<p class="empty-state">没有找到匹配内容</p>';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch();
      });
    }
    [input, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', renderSearch);
        element.addEventListener('change', renderSearch);
      }
    });
    renderSearch();
  }
})();
