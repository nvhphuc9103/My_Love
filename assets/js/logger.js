const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxRHjF7N0B2VAL_gakmr2k7i2DVTZr3DTfJK-B3UKjHZKt_y9z1wTWiMlUtWuWFAwdEQQ/exec";

const LOG_QUEUE_KEY = "loveLogQueue";
window.__loveLogImages = window.__loveLogImages || [];

function shortText(value, max = 250) {
  value = value == null ? "" : String(value);
  return value.length > max ? value.slice(0, max) : value;
}

function makeEventId() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInviteCode() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("code");

  if (fromUrl) {
    localStorage.setItem("inviteCode", fromUrl);
    return fromUrl;
  }

  return localStorage.getItem("inviteCode") || "no-code";
}

function getFramePage() {
  const frame = document.getElementById("loveFrame");

  try {
    if (frame && frame.contentWindow) {
      const path = frame.contentWindow.location.pathname;
      return path.split("/").pop() || "intro.html";
    }
  } catch (err) {}

  return "index.html";
}

function getCachedGeo() {
  try {
    return JSON.parse(localStorage.getItem("loveGeoApprox") || "{}");
  } catch (err) {
    return {};
  }
}

function buildPayload(data = {}) {
  const geo = getCachedGeo();

  return {
    eventId: data.eventId || makeEventId(),
    type: shortText(data.type || "event", 50),
    choice: shortText(data.choice || "", 80),
    page: shortText(data.page || getFramePage(), 100),
    note: shortText(data.note || "", 250),

    inviteCode: shortText(getInviteCode(), 120),
    referrer: shortText(document.referrer || "direct", 250),
    device: window.innerWidth < 768 ? "mobile" : "desktop",
    screen: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",

    geoCity: shortText(geo.geoCity || "", 100),
    geoRegion: shortText(geo.geoRegion || "", 100),
    geoCountry: shortText(geo.geoCountry || "", 100),
    geoOrg: shortText(geo.geoOrg || "", 180),

    userAgent: shortText(navigator.userAgent || "", 300),
    clientTime: new Date().toISOString()
  };
}

function sendByImage(payload) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value == null ? "" : String(value));
  });

  params.append("_t", Date.now());

  const img = new Image();

  // Giữ object Image lại vài giây để Android không hủy request quá sớm
  window.__loveLogImages.push(img);

  img.onload = img.onerror = () => {
    setTimeout(() => {
      const index = window.__loveLogImages.indexOf(img);
      if (index >= 0) {
        window.__loveLogImages.splice(index, 1);
      }
    }, 3000);
  };

  img.src = `${GOOGLE_SHEET_WEB_APP_URL}?${params.toString()}`;

  return true;
}

function saveQueue(payload) {
  const queue = JSON.parse(localStorage.getItem(LOG_QUEUE_KEY) || "[]");
  queue.push(payload);

  // Không để queue phình quá lớn
  const trimmed = queue.slice(-30);
  localStorage.setItem(LOG_QUEUE_KEY, JSON.stringify(trimmed));
}

function flushQueue() {
  const queue = JSON.parse(localStorage.getItem(LOG_QUEUE_KEY) || "[]");

  if (!queue.length) return;

  localStorage.removeItem(LOG_QUEUE_KEY);

  queue.forEach((payload) => {
    sendByImage(payload);
  });
}

window.logLoveEvent = function logLoveEvent(data = {}) {
  const payload = buildPayload(data);

  if (navigator.onLine === false) {
    saveQueue(payload);
    return payload.eventId;
  }

  sendByImage(payload);
  return payload.eventId;
};

window.addEventListener("online", flushQueue);

window.addEventListener("load", () => {
  flushQueue();

  let navType = "visit";

  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.type) {
      navType = nav.type; 
      // navigate, reload, back_forward
    }
  } catch (err) {}

  window.logLoveEvent({
    type: "visit",
    page: "index.html",
    note: `Mở trang: ${navType}`
  });
});