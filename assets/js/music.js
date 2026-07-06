const GEO_CACHE_KEY = "loveGeoApprox";
const GEO_CACHE_TIME_KEY = "loveGeoApproxTime";
const GEO_CACHE_MS = 6 * 60 * 60 * 1000; // lưu tạm 6 tiếng, tránh gọi API liên tục

async function getApproxGeoByIP() {
  try {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    const cachedAt = Number(localStorage.getItem(GEO_CACHE_TIME_KEY) || 0);

    if (cached && Date.now() - cachedAt < GEO_CACHE_MS) {
      return JSON.parse(cached);
    }

    const response = await fetch("https://ipapi.co/json/", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Không lấy được IP location");
    }

    const data = await response.json();

    const geo = {
      geoSource: "ipapi.co",
      geoCity: data.city || "",
      geoRegion: data.region || "",
      geoCountry: data.country_name || data.country || "",
      geoLatitude: data.latitude || "",
      geoLongitude: data.longitude || "",
      geoTimezone: data.timezone || "",
      geoOrg: data.org || data.asn || "",
      geoPostal: data.postal || ""
    };

    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
    localStorage.setItem(GEO_CACHE_TIME_KEY, String(Date.now()));

    return geo;
  } catch (error) {
    return {
      geoSource: "ipapi.co-failed",
      geoCity: "",
      geoRegion: "",
      geoCountry: "",
      geoLatitude: "",
      geoLongitude: "",
      geoTimezone: "",
      geoOrg: "",
      geoPostal: ""
    };
  }
}

window.getApproxGeoByIP = getApproxGeoByIP;

// Gọi sớm để khi sang trang choice dữ liệu đã sẵn sàng
getApproxGeoByIP();

const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxRHjF7N0B2VAL_gakmr2k7i2DVTZr3DTfJK-B3UKjHZKt_y9z1wTWiMlUtWuWFAwdEQQ/exec";

function getInviteCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || localStorage.getItem("inviteCode") || "no-code";
  localStorage.setItem("inviteCode", code);
  return code;
}

async function logVisitToSheet(page = "index") {
  const geo = await getApproxGeoByIP();

  const payload = {
    type: "visit",
    choice: "",
    page,
    note: "Mở trang web",
    inviteCode: getInviteCode(),
    referrer: document.referrer || "direct",
    device: window.innerWidth < 768 ? "mobile" : "desktop",
    screen: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || "",
    userAgent: navigator.userAgent,
    time: new Date().toISOString(),

    geoSource: geo.geoSource || "",
    geoCity: geo.geoCity || "",
    geoRegion: geo.geoRegion || "",
    geoCountry: geo.geoCountry || "",
    geoLatitude: geo.geoLatitude || "",
    geoLongitude: geo.geoLongitude || "",
    geoTimezone: geo.geoTimezone || "",
    geoOrg: geo.geoOrg || "",
    geoPostal: geo.geoPostal || ""
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], {
      type: "text/plain;charset=UTF-8"
    });

    navigator.sendBeacon(GOOGLE_SHEET_WEB_APP_URL, blob);
    return;
  }

  fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8"
    },
    body
  }).catch(() => {});
}

logVisitToSheet("index");

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
