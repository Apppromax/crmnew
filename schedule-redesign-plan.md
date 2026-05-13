# Kế hoạch Tái thiết kế Giao diện Lịch Hẹn (Schedule UI)

## 1. Cấu trúc Timeline (Trục thời gian)
- **Gom nhóm theo giờ (Grouping):** Các lịch hẹn trong cùng một ngày sẽ được tự động gom nhóm theo từng khung giờ (Ví dụ: 09:00, 10:00).
- **Trục thời gian trực quan:** Bên trái màn hình sẽ có một đường kẻ dọc (timeline) cùng các điểm neo (nodes). Khách hàng sẽ được hiển thị như những sự kiện trên trục thời gian này.

## 2. Trải nghiệm Vuốt (Swipe Actions)
- Sử dụng `framer-motion` (`drag="x"`) để tạo thao tác vuốt.
- Vuốt một thẻ khách hàng sang **Trái** để mở nút **Dời lịch** (Reschedule).
- Vuốt thẻ sang **Phải** để mở nút **Xong** (Complete).
- Có giới hạn độ đàn hồi (`dragConstraints`) để tránh bị xung đột với thao tác "Back/Forward" mặc định của trình duyệt Safari/Chrome trên mobile.

## 3. Phân cấp thị giác (Visual Hierarchy & Color Coding)
- Thiết kế hệ thống màu sắc dựa theo Độ Nét Gốc (Heat Level):
  - 🔥 **Rất Nét:** Nền Đỏ nhạt (bg-red-50), viền đỏ, chữ đỏ.
  - ☀️ **Tiềm Năng:** Nền Vàng (bg-amber-50).
  - 👁️ **Quan Tâm:** Nền Xanh (bg-blue-50).
  - ❄️ **Tham Khảo / Chưa Rõ:** Nền xám nhạt (bg-slate-50).
- Các khách hàng Quá hạn (Overdue) sẽ bị đẩy lên đầu cùng thiết kế cảnh báo đỏ.

## 4. Tương tác khác
- Modal chi tiết vẫn được giữ nhưng với giao diện gọn gàng hơn.
- Cải thiện thanh chọn Ngày (Date Strip) phía trên: Thêm hiệu ứng chọn ngày mượt mà.
- Màn hình trạng thái trống (Empty state) thân thiện hơn với người dùng.
