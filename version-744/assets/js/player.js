(function () {
  function initMoviePlayer(videoUrl) {
    const root = document.querySelector("[data-player-root]");
    if (!root) {
      return;
    }
    const video = root.querySelector("video");
    const overlay = root.querySelector(".player-overlay");
    let hls = null;
    function prepare() {
      if (!video || video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      video.dataset.ready = "1";
    }
    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
  window.initMoviePlayer = initMoviePlayer;
})();
