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
});

yesBtn.addEventListener("click", () => {
  yesBtn.textContent = "Đang mở trái tim... 💖";
  yesBtn.disabled = true;
  setTimeout(() => {
    goLovePage("yes");
  }, 700);
});

window.addEventListener("resize", () => {
  if (thinkBtn.classList.contains("moving")) moveThinkButton();
});
