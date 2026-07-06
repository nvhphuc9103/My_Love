const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxRHjF7N0B2VAL_gakmr2k7i2DVTZr3DTfJK-B3UKjHZKt_y9z1wTWiMlUtWuWFAwdEQQ/exec";

async function logChoiceToSheet(choice, note = "") {
  let geo = {};

  try {
    if (window.parent && window.parent.getApproxGeoByIP) {
      geo = await window.parent.getApproxGeoByIP();
    } else {
      geo = JSON.parse(localStorage.getItem("loveGeoApprox") || "{}");
    }
  } catch (error) {
    geo = {};
  }

  const inviteCode = localStorage.getItem("inviteCode") || "no-code";

  const payload = {
    type: "choice",
    choice,
    page: "choice.html",
    note,
    inviteCode,
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
function goLovePage(page) {
  try {
    if (window.parent && window.parent !== window && typeof window.parent.goLovePage === "function") {
      window.parent.goLovePage(page);
      return;
    }
  } catch (error) {}

  window.location.href = `${page}.html`;
}

const yesBtn = document.getElementById("yesBtn");
const thinkBtn = document.getElementById("thinkBtn");
const choiceArea = document.getElementById("choiceArea");
const choiceNote = document.getElementById("choiceNote");

let cooldown = 5;
let isCoolingDown = false;
let clickCount = 0;

function moveThinkButton() {
  const areaRect = choiceArea.getBoundingClientRect();
  const btnRect = thinkBtn.getBoundingClientRect();

  thinkBtn.classList.add("moving");

  const padding = 8;
  const maxLeft = Math.max(padding, areaRect.width - btnRect.width - padding);
  const maxTop = Math.max(padding, areaRect.height - btnRect.height - padding);

  const left = Math.random() * maxLeft;
  const top = Math.random() * maxTop;

  thinkBtn.style.left = `${left}px`;
  thinkBtn.style.top = `${top}px`;
}

function startCooldown(seconds) {
  isCoolingDown = true;
  thinkBtn.disabled = true;
  let remaining = seconds;
  thinkBtn.textContent = `Suy nghĩ thêm (${remaining}s)`;

  const timer = setInterval(() => {
    remaining -= 1;
    thinkBtn.textContent = remaining > 0 ? `Suy nghĩ thêm (${remaining}s)` : "Suy nghĩ thêm";

    if (remaining <= 0) {
      clearInterval(timer);
      thinkBtn.disabled = false;
      isCoolingDown = false;
    }
  }, 1000);
}

thinkBtn.addEventListener("click", () => {
  if (isCoolingDown) return;
  clickCount += 1;
  moveThinkButton();
  choiceNote.textContent = clickCount === 1
    ? "Anh biết quyết định này cần thời gian. Nhưng nút này hình như cũng đang ngại bị bấm lại đó..."
    : "Anh vẫn chờ câu trả lời của Vân, nhưng trái tim anh thì đang nghiêng về nút bên kia nhiều lắm.";

  startCooldown(cooldown);
  cooldown *= 2;
  logChoiceToSheet("Suy nghĩ thêm", "Vân đã bấm nút Suy nghĩ thêm");
});

yesBtn.addEventListener("click", () => {
  yesBtn.textContent = "Đang mở trái tim... 💖";
  yesBtn.disabled = true;
  setTimeout(() => {
    goLovePage("yes");
  }, 700);
  logChoiceToSheet("Đồng ý", "Vân đã bấm nút Đồng ý");
});

window.addEventListener("resize", () => {
  if (thinkBtn.classList.contains("moving")) moveThinkButton();
});
