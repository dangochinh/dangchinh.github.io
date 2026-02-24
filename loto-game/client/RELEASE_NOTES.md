# 📋 Release Notes - Loto Online

---

## v1.4.0 — SEO & Reconnect (2026-02-24)

### ✨ New Features
- **Player Reconnect**: Người chơi có thể kết nối lại khi bị mất kết nối giữa ván
  - Tự động cache trạng thái game vào session → refresh trang không mất vé
  - Tự động retry kết nối 2 lần trước khi báo lỗi
  - Nút "Thử Kết Nối Lại" thay vì chỉ có "Về Trang Chủ"
  - Banner "Đang kết nối lại..." hiện khi đang reconnect
- **Host: Highlight số chờ xổ**: Khi hàng đã xổ 4/5 số, số còn lại nhấp nháy vàng trong "Xem Vé"
- **Nút Info**: Hiện ở tất cả màn hình (Home, Player, Host)
- **Tự Động Dò cooldown**: Chỉ dùng được mỗi 30 giây + nút Đóng

### 🔍 SEO
- Tối ưu SEO Level 1: title, meta description, Open Graph, Twitter Card
- Thêm `robots.txt`, `sitemap.xml`, JSON-LD structured data
- Đăng ký Google Search Console
- Thêm favicon mới (SVG gradient)

---

## v1.3.0 — Mid-Game Protection & Bingo Trùng (2026-02-21)

### ✨ New Features
- **Bảo vệ phòng giữa ván**: Chặn người chơi mới tham gia khi ván đang diễn ra
- **Bingo Trùng**: Cửa sổ 5 giây để nhiều người cùng kinh khi có người thắng
- Hiện banner thông báo "Bingo trùng" cho tất cả người chơi

### 🐛 Bug Fixes
- Sửa lỗi biến không sử dụng
- Cải thiện xử lý state game

---

## v1.2.0 — Bingo Win Celebration (2026-02-03)

### ✨ New Features
- **Winner Modal**: Pop-up celebration với confetti animation khi có người thắng
- **Tự Động Dò**: Nút auto-mark tất cả số đã rút trên vé
- **Xem số đã rút**: Popup hiển thị toàn bộ số đã quay
- Host: Xem vé của tất cả người chơi
- Host: Cấu hình thời gian quay số

### 🎨 UI Improvements
- Giao diện mobile-first được tối ưu
- Animation và hiệu ứng mượt mà hơn
