# Web tỏ tình gửi Ngọc Vân - bản nhạc liên tục

## Điểm mới trong bản này

- `index.html` là trang khung chính, giữ nhạc nền chạy liên tục.
- Các trang nội dung chạy bên trong khung:
  - `intro.html` - mở đầu bầu trời sao
  - `story.html` - câu chuyện thổ lộ
  - `choice.html` - câu hỏi đồng ý / suy nghĩ thêm
  - `yes.html` - trái tim điểm sáng + lời hứa
- Khi chuyển từ trang này sang trang khác, trình duyệt không tải lại toàn bộ web nên nhạc không bị phát lại từ đầu.
- File nhạc có `loop`, phát hết sẽ quay lại phát tiếp.
- Trang `yes.html` dùng lại phong cách trái tim điểm sáng đẹp hơn, có bảng lời hứa tự hiện sau khoảng 5 giây, có nút Ẩn / Hiện lời hứa, và có thể cuộn lên xuống.

## Cách thêm nhạc nền

Tạo thư mục và đặt file:

```text
assets/audio/love-theme.mp3
```

Bạn hãy đổi tên file nhạc đã tìm được thành đúng:

```text
love-theme.mp3
```

rồi đặt vào thư mục:

```text
assets/audio/
```

Lưu ý: trình duyệt thường không cho tự phát nhạc nếu người xem chưa bấm vào trang. Vì vậy nhạc sẽ bắt đầu sau lần bấm/chạm đầu tiên, ví dụ khi bấm nút "Khám phá".

## Cách chạy local

Nên mở bằng VS Code + Live Server.

Không nên mở file bằng double click trực tiếp vì `intro.html` dùng Three.js dạng module.

## Cách đưa lên GitHub Pages

Upload toàn bộ nội dung thư mục này lên repository GitHub. Đảm bảo `index.html` nằm ở thư mục gốc.

Vào:

```text
Settings → Pages → Deploy from a branch → main → /root → Save
```

GitHub Pages sẽ tạo link dạng:

```text
https://ten-github-cua-ban.github.io/ten-repo/
```

## Chỗ chỉnh thời gian hiện bảng lời hứa

Mở:

```text
assets/js/yes-heart.js
```

Sửa dòng:

```js
const SHOW_CARD_AFTER_SECONDS = 5.15;
```

## Chỗ chỉnh số lượng hạt trái tim

Mở:

```text
assets/js/yes-heart.js
```

Tìm dòng:

```js
const count = reducedMotion ? (isMobile ? 420 : 760) : (isMobile ? 700 : 1350);
```

Tăng số lượng nếu muốn trái tim dày hơn, giảm nếu điện thoại bị lag.
