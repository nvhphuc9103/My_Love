function goLovePage(page) {
  try {
    if (window.parent && window.parent !== window && typeof window.parent.goLovePage === "function") {
      window.parent.goLovePage(page);
      return;
    }
  } catch (error) {}

  window.location.href = `${page}.html`;
}

const storyPages = [
  {
    step: "01",
    tag: "Trước khi gặp em",
    title: "Anh vốn đang yên bình",
    text: "Trước khi gặp em, cuộc sống của anh khá yên ổn.\nMọi thứ cứ trôi qua nhẹ nhàng, không quá mong chờ, cũng không nghĩ sẽ có ai bất ngờ bước vào lòng mình.",
    icon: "🌙",
    caption: "Một khoảng trời bình yên trước khi có một người bước vào",
    bg: "peace"
  },
  {
    step: "02",
    tag: "Rồi em xuất hiện",
    title: "Một sự xuất hiện rất bất ngờ",
    text: "Mình kết bạn, rồi bắt đầu trò chuyện.\nBan đầu, anh không nghĩ có ngày mình sẽ thích em,… có chút phiền phức… nhưng không hiểu sao, càng lúc lại thấy phiền phức này... có chút đáng yêu.",
    icon: "✨",
    caption: "Có người đến rất nhẹ, nhưng để lại trong lòng rất lâu",
    bg: "meet"
  },
  {
    step: "03",
    tag: "Từ những tin nhắn nhỏ",
    title: "Ngày nào cũng muốn nhắn với em",
    text: "Từ vài câu hỏi thăm, vài chuyện vụn vặt, rồi dần dần thành thói quen.\nCó những lúc nhắn với em, anh đã mình vui hơn một chút...",
    icon: "💬",
    caption: "Những dòng tin nhắn nhỏ dần trở thành điều anh mong chờ",
    bg: "chat"
  },
  {
    step: "04",
    tag: "Dù chỉ qua một màn hình",
    title: "Xa mà vẫn thấy gần",
    text: "Mình cách nhau bằng một chiếc màn hình, nhưng cảm xúc thì không hề xa như vậy.\nAnh vui khi được nghe em kể chuyện, được cùng em chia sẻ những điều thú vị, được cảm nhận rằng mình đang gần nhau hơn từng ngày.",
    icon: "📱",
    caption: "Một chiếc màn hình, nhưng hai trái tim thì không hẳn xa nhau",
    bg: "screen"
  },
  {
    step: "05",
    tag: "Khi em buồn",
    title: "Anh cũng thấy lòng mình chùng xuống",
    text: "Khi em buồn, anh cũng thấy buồn theo.\nAnh muốn được quan tâm, được lắng nghe, được chia sẻ với em nhiều hơn — không phải vì trách nhiệm, mà vì thật lòng anh để tâm đến em.",
    icon: "🌧️",
    caption: "Nếu em buồn, anh cũng rất muốn ở đó cùng em",
    bg: "care"
  },
  {
    step: "06",
    tag: "Điều anh không ngờ tới",
    title: "Có ngày mình lại xao động vì em",
    text: "Có lẽ ban đầu em không nằm trong bộ lọc anh tìm kiếm... hoặc ít nhất là vì gì chắc em cũng biết.\nNhưng dần dần, chính em lại trở nên đặc biệt hơn tất cả. Không phải vì em hoàn hảo, mà vì em là em.",
    icon: "🌷",
    caption: "Đôi khi người đặc biệt nhất không đến theo cách mình tưởng tượng",
    bg: "change"
  },
  {
    step: "07",
    tag: "Anh nghĩ em cũng cảm nhận được",
    title: "Giữa mình có điều gì đó rất khác",
    text: "Anh cảm nhận được rằng có lẽ em cũng đã dành cho anh một tình cảm nhất định.\nNhưng anh không muốn để mọi thứ chỉ lưng chừng trong những câu nói đùa hay những lần ngập ngừng nữa.",
    icon: "💫",
    caption: "Có những điều nếu nghiêm túc, mình nên nói bằng tất cả chân thành",
    bg: "feeling"
  },
  {
    step: "08",
    tag: "Lời anh muốn nói",
    title: "Ngọc Vân à, anh thích em!",
    text: "Anh muốn nhân dịp này để chủ động nói rõ lòng mình.\nĐây không chỉ là một lời tỏ tình, mà là một lời chính thức: anh muốn cùng em bước qua tình bạn hay tình anh em, bằng sự chân thành và nghiêm túc của anh.",
    icon: "💖",
    caption: "Từ hôm nay, anh muốn gọi điều này là tình yêu",
    bg: "confess"
  }
];

let currentPage = 0;

const storyCard = document.getElementById("storyCard");
const storyStep = document.getElementById("storyStep");
const progressBar = document.getElementById("progressBar");
const sceneOrb = document.getElementById("sceneOrb");
const sceneCaption = document.getElementById("sceneCaption");
const storyTag = document.getElementById("storyTag");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

function renderPage() {
  const page = storyPages[currentPage];
  document.body.className = `story-page story-bg-${page.bg}`;
  storyStep.textContent = page.step;
  progressBar.style.width = `${((currentPage + 1) / storyPages.length) * 100}%`;
  sceneOrb.textContent = page.icon;
  sceneCaption.textContent = page.caption;
  storyTag.textContent = page.tag;
  storyTitle.textContent = page.title;
  storyText.textContent = page.text;
  backBtn.disabled = currentPage === 0;
  nextBtn.textContent = currentPage === storyPages.length - 1 ? "Đến câu hỏi cuối" : "Tiếp tục";
}

function changePage(nextIndex) {
  storyCard.classList.add("changing");
  setTimeout(() => {
    currentPage = nextIndex;
    renderPage();
    storyCard.classList.remove("changing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 280);
}

nextBtn.addEventListener("click", () => {
  if (currentPage === storyPages.length - 1) {
    storyCard.classList.add("changing");
    setTimeout(() => {
      goLovePage("choice");
    }, 360);
    return;
  }
  changePage(currentPage + 1);
});

backBtn.addEventListener("click", () => {
  if (currentPage > 0) changePage(currentPage - 1);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "Enter") nextBtn.click();
  if (event.key === "ArrowLeft" && currentPage > 0) backBtn.click();
});

renderPage();
