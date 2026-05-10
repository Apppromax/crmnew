# UI Design System
**Dự án:** SalesPush CRM MVP

## 1. Triết lý thiết kế (Design Philosophy)
- **Mobile-first:** Giao diện tối ưu hoàn toàn cho màn hình dọc. Nút bấm to, thanh điều hướng nằm dưới cùng (Bottom Navigation) để dễ chạm bằng một ngón tay cái.
- **Glassmorphism:** Sử dụng hiệu ứng kính mờ (Backdrop Blur) cho các component nổi bật.
- **Micro-animations:** Nút bấm và thẻ card có hiệu ứng scale nhẹ khi chạm/click (`active:scale-[0.98]`).

## 2. Bảng màu (Color Palette)
Cấu trúc trong file `globals.css` (Tailwind 4):
- **Trạng thái khách hàng (Status Badges):**
  - `New`: Blue (`bg-blue-500`)
  - `Active`: Emerald (`bg-emerald-500`)
  - `Waiting`: Amber (`bg-amber-500`)
  - `Dormant`: Gray (`bg-gray-500`)
  - `Closed`: Purple (`bg-purple-500`)
  - `Lost`: Red (`bg-red-500`)

## 3. Hệ thống Component Lõi
- **SmartCard:** Hiển thị tên, sđt, trạng thái, và lịch hẹn tiếp theo. Cạnh viền trái có vạch màu tương ứng với màu trạng thái.
- **StatusModal:** Bottom-sheet trượt lên từ dưới cùng màn hình khi chọn thay đổi trạng thái. Có lớp phủ tối màu mờ (`backdrop-blur`).
