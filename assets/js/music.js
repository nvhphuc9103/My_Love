(() => {
  const frame = document.getElementById("loveFrame");
  const control = document.getElementById("musicControl");
  const tip = document.getElementById("musicTip");
  const text = control?.querySelector(".music-text");

  const MUSIC_FILE = "assets/audio/love-theme.mp3";
  const ENABLED_KEY = "ngocVanPersistentMusicEnabled";
  const TIME_KEY = "ngocVanPersistentMusicTime";
  const PAGE_KEY = "ngocVanCurrentPage";

  const pages = {
    intro: "intro.html",
    story: "story.html",
    choice: "choice.html",
    yes: "yes.html"
  };

  let wanted = localStorage.getItem(ENABLED_KEY) === "on";
  let playing = false;
  let restoring = false;
  let tipTimer = null;

  const audio = new Audio(MUSIC_FILE);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.36;

  function showTip(message) {
    if (!tip) return;
    tip.textContent = message;
    tip.classList.add("show");
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove("show"), 2600);
  }

  function updateControl() {
    if (!control || !text) return;
    control.classList.toggle("is-playing", playing);
    text.textContent = playing ? "Nhạc đang bật" : "Bật nhạc";
  }

  function restoreTimeOnce() {
    if (restoring) return;
    restoring = true;
    const saved = Number(localStorage.getItem(TIME_KEY) || "0");
    if (Number.isFinite(saved) && saved > 0) {
      try { audio.currentTime = saved; } catch (error) {}
    }
  }

  async function startMusic() {
    wanted = true;
    localStorage.setItem(ENABLED_KEY, "on");
    restoreTimeOnce();

    try {
      await audio.play();
      playing = true;
      updateControl();
      return true;
    } catch (error) {
      playing = false;
      updateControl();
      showTip("Trình duyệt cần bạn bấm thêm một lần để bật nhạc.");
      return false;
    }
  }

  function pauseMusic() {
    wanted = false;
    localStorage.setItem(ENABLED_KEY, "off");
    audio.pause();
    playing = false;
    updateControl();
  }

  function pageToFile(page) {
    if (!page) return pages.intro;
    if (pages[page]) return pages[page];
    if (page.endsWith(".html")) return page;
    return `${page}.html`;
  }

  function fileToPage(file) {
    const clean = String(file || "intro.html").split("/").pop();
    return clean.replace(".html", "") || "intro";
  }

  window.goLovePage = function goLovePage(page) {
    const file = pageToFile(page);
    const key = fileToPage(file);
    localStorage.setItem(PAGE_KEY, key);

    if (window.location.hash !== `#${key}`) {
      history.replaceState(null, "", `#${key}`);
    }

    frame.classList.add("is-changing");
    setTimeout(() => {
      frame.src = file;
    }, 180);
  };

  window.startLoveMusic = startMusic;
  window.pauseLoveMusic = pauseMusic;

  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "love:startMusic") startMusic();
    if (data.type === "love:navigate") window.goLovePage(data.page);
  });

  frame.addEventListener("load", () => {
    frame.classList.remove("is-changing");
    if (wanted && audio.paused) startMusic();
  });

  control.addEventListener("click", () => {
    if (playing) pauseMusic();
    else startMusic();
  });

  audio.addEventListener("play", () => {
    playing = true;
    updateControl();
  });

  audio.addEventListener("pause", () => {
    playing = false;
    updateControl();
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration && Number.isFinite(audio.currentTime)) {
      localStorage.setItem(TIME_KEY, String(audio.currentTime));
    }
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    if (wanted) audio.play().catch(() => {});
  });

  audio.addEventListener("error", () => {
    showTip("Chưa tìm thấy file assets/audio/love-theme.mp3. Hãy đặt nhạc vào đúng thư mục này.");
  });

  window.addEventListener("beforeunload", () => {
    if (audio.currentTime) localStorage.setItem(TIME_KEY, String(audio.currentTime));
  });

  const initialPage = "intro";

  // Xóa trang đã lưu, để mỗi lần mở link gốc luôn bắt đầu từ intro
  localStorage.setItem(PAGE_KEY, "intro");
  
  // Nếu URL đang bị dính #yes, #story, #choice thì xóa luôn
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  
  frame.src = pageToFile(initialPage);
  updateControl();

  if (wanted) {
    showTip("Bấm bất kỳ đâu một lần để tiếp tục nhạc nền.");
  }
})();
