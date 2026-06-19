(function () {
    function startPlayer(video, button, streamUrl) {
        if (!video || !streamUrl) {
            return;
        }

        if (!video.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = streamUrl;
            }
            video.setAttribute('data-ready', '1');
        }

        if (button) {
            button.classList.add('hidden');
        }

        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(function () {
                if (button) {
                    button.classList.remove('hidden');
                }
            });
        }
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('moviePlayButton');

        if (!video) {
            return;
        }

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(video, button, streamUrl);
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayer(video, button, streamUrl);
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && !video.ended) {
                button.classList.remove('hidden');
            }
        });
    };
})();
