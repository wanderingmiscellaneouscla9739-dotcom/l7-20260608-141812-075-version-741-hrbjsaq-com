(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const grids = Array.from(document.querySelectorAll('[data-card-grid]'));
  const normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };
  const getText = function (card) {
    return normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.textContent
    ].join(' '));
  };
  const applyFilters = function () {
    const librarySearch = document.querySelector('[data-library-search]');
    const localSearch = document.querySelector('[data-card-filter]');
    const channelFilter = document.querySelector('[data-channel-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const query = normalize((librarySearch && librarySearch.value) || (localSearch && localSearch.value) || '');
    const channel = channelFilter ? channelFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';
    grids.forEach(function (grid) {
      Array.from(grid.children).forEach(function (card) {
        const matchesQuery = !query || getText(card).indexOf(query) !== -1;
        const matchesChannel = !channel || card.dataset.channel === channel;
        const matchesYear = !year || card.dataset.year === year;
        card.classList.toggle('is-hidden-card', !(matchesQuery && matchesChannel && matchesYear));
      });
    });
  };
  const sortCards = function (mode) {
    grids.forEach(function (grid) {
      const cards = Array.from(grid.children);
      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  };
  Array.from(document.querySelectorAll('[data-library-search], [data-card-filter], [data-channel-filter], [data-year-filter]')).forEach(function (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });
  Array.from(document.querySelectorAll('[data-sort-select]')).forEach(function (select) {
    select.addEventListener('change', function () {
      sortCards(select.value);
      applyFilters();
    });
    sortCards(select.value);
  });

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const libraryInput = document.querySelector('[data-library-search]');
  if (q && libraryInput) {
    libraryInput.value = q;
    applyFilters();
  }

  const video = document.querySelector('[data-stream]');
  if (video) {
    const stream = video.getAttribute('data-stream');
    const playButton = document.querySelector('[data-play-button]');
    const hideButton = function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };
    const showButton = function () {
      if (playButton && video.paused) {
        playButton.classList.remove('is-hidden');
      }
    };
    if (stream) {
      if (window.Hls && window.Hls.isSupported()) {
        const hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsPlayer.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsPlayer.recoverMediaError();
            } else {
              hlsPlayer.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
    }
    if (playButton) {
      playButton.addEventListener('click', function () {
        const promise = video.play();
        hideButton();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showButton();
          });
        }
      });
    }
    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
  }
})();
