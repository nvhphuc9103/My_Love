document.addEventListener("DOMContentLoaded", () => {
  function recordChoice(choice, note = "") {
    if (window.parent && window.parent.logLoveEvent) {
      window.parent.logLoveEvent({
        type: "choice",
        page: "choice.html",
        choice,
        note
      });
      return;
    }

    if (window.logLoveEvent) {
      window.logLoveEvent({
        type: "choice",
        page: "choice.html",
        choice,
        note
      });
    }
  }

  function goPage(page) {
    if (window.parent && window.parent.goLovePage) {
      window.parent.goLovePage(page);
    } else {
      window.location.href = `${page}.html`;
    }
  }

  const yesBtn = document.getElementById("yesBtn");
  const thinkBtn = document.getElementById("thinkBtn");
  const choiceArea = document.getElementById("choiceArea");
  const choiceNote = document.getElementById("choiceNote");

  if (!yesBtn || !thinkBtn || !choiceArea || !choiceNote) {
    console.error("Thiếu phần tử HTML: yesBtn, thinkBtn, choiceArea hoặc choiceNote");
    return;
  }

  let cooldown = 5;
  let isCoolingDown = false;
  let thinkClickCount = 0;

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

      thinkBtn.textContent =
        remaining > 0 ? `Suy nghĩ thêm (${remaining}s)` : "Suy nghĩ thêm";

      if (remaining <= 0) {
        clearInterval(timer);
        thinkBtn.disabled = false;
        isCoolingDown = false;
      }
    }, 1000);
  }

  thinkBtn.addEventListener("click", () => {
    if (isCoolingDown) return;

    thinkClickCount += 1;

    recordChoice(
      "Suy nghĩ thêm",
      `Lần bấm thứ ${thinkClickCount}`
    );

    moveThinkButton();

    choiceNote.textContent =
      thinkClickCount === 1
        ? "Anh biết quyết định này cần thời gian. Nhưng nút này hình như cũng đang ngại bị bấm lại đó..."
        : "Anh vẫn chờ câu trả lời của em, nhưng trái tim anh thì đang nghiêng về nút bên kia nhiều lắm.";

    startCooldown(cooldown);
    cooldown *= 2;
  });

  yesBtn.addEventListener("click", () => {
    yesBtn.textContent = "Đang mở trái tim... 💖";
    yesBtn.disabled = true;

    recordChoice("Đồng ý", "Bấm nút Đồng ý");

    setTimeout(() => {
      goPage("yes");
    }, 900);
  });

  window.addEventListener("resize", () => {
    if (thinkBtn.classList.contains("moving")) {
      moveThinkButton();
    }
  });
});