(() => {
    const mobileButton = document.querySelector('[data-mobile-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img[data-cover]').forEach((image) => {
        image.addEventListener('error', () => {
            image.style.opacity = '0';
        });
    });

    const hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            setInterval(() => showSlide(current + 1), 5600);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
        const search = scope.querySelector('[data-filter-search]');
        const year = scope.querySelector('[data-filter-year]');
        const type = scope.querySelector('[data-filter-type]');
        const cards = Array.from(scope.querySelectorAll('[data-title]'));
        const empty = scope.querySelector('[data-empty-state]');

        const filterCards = () => {
            const query = search ? search.value.trim().toLowerCase() : '';
            const yearValue = year ? year.value : '';
            const typeValue = type ? type.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year
                ].join(' ').toLowerCase();
                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !yearValue || card.dataset.year === yearValue;
                const matchesType = !typeValue || card.dataset.type.includes(typeValue);
                const show = matchesQuery && matchesYear && matchesType;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        [search, year, type].forEach((control) => {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');
        if (search && initialQuery) {
            search.value = initialQuery;
        }
        filterCards();
    });

    const playerShell = document.querySelector('[data-player-shell]');
    const video = document.querySelector('[data-video-player]');
    const overlay = document.querySelector('[data-play-overlay]');
    const status = document.querySelector('[data-player-status]');
    let hlsInstance = null;
    let playerReady = false;
    let playerLoading = false;

    const setStatus = (message) => {
        if (status) {
            status.textContent = message;
        }
    };

    const startVideo = () => {
        if (!video || !playerShell || playerLoading) {
            return;
        }

        if (playerReady) {
            video.play().catch(() => setStatus('请再次点击播放'));
            return;
        }

        const source = video.dataset.src;
        if (!source) {
            setStatus('播放源未绑定');
            return;
        }

        playerLoading = true;
        setStatus('正在连接播放源');

        const playNow = () => {
            playerReady = true;
            playerLoading = false;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.play().catch(() => setStatus('请点击播放器继续播放'));
        };

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playNow, { once: true });
            video.addEventListener('error', () => {
                playerLoading = false;
                setStatus('视频加载失败，请稍后重试');
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playNow);
            hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    playerLoading = false;
                    setStatus('视频加载失败，请稍后重试');
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                }
            });
            return;
        }

        playerLoading = false;
        setStatus('当前浏览器不支持 HLS 播放');
    };

    if (playerShell && video) {
        playerShell.addEventListener('click', (event) => {
            if (event.target === video && playerReady) {
                return;
            }
            startVideo();
        });
    }

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
