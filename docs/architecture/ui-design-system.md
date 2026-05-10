# UI Design System
**Dự án:** SalesPush CRM MVP

## Khung Công Nghệ (UI Foundation)
- **Framework**: React / Next.js
- **Styling**: TailwindCSS v4
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Theme**: Biến CSS tùy chỉnh (`globals.css`) tích hợp sẵn với hệ thống màu của shadcn.

## Triết lý thiết kế
- **Responsive & Cross-platform**: 
  - Mobile: Layout tập trung với Bottom Nav (Menu ở dưới đáy), tối ưu cho thao tác 1 tay (thumb-zone). Các nút CTA to, khoảng cách chạm tối thiểu 44px.
  - Tablet/Desktop (PC): Giao diện tự động chuyển Navigation thành Sidebar bên trái, tận dụng không gian rộng để hiển thị danh sách dạng Grid (2-3 cột), Nút Thêm (CTA) chuyển lên góc trên cùng hoặc góc phải.
- **Glassmorphism**: Sử dụng class `glass` (nền bán trong suốt + backdrop-blur) để tạo chiều sâu và cảm giác hiện đại, cao cấp.
- **10-Second Rule**: Mọi thao tác chăm sóc khách hàng phải hoàn thành trong 10 giây (Sử dụng Swipe Actions, Bottom Sheets).
- **Accessibility (a11y)**: Sử dụng cấu trúc Radix UI (bên dưới shadcn) để hỗ trợ screen reader và keyboard navigation.
- **Tinder-like Swipe**: Tương tác cốt lõi trên trang chủ áp dụng vuốt thẻ như Tinder (hỗ trợ cả chạm và kéo chuột): Vuốt trái để Tạm gác (Snooze), Vuốt phải để Cập nhật thông tin.

## Color Palette (Tokens)
Hệ thống màu tự động thay đổi theo Light/Dark Mode thông qua CSS Variables.
```css
:root {
  --background: oklch(0.97 0.01 250);
  --foreground: oklch(0.15 0.02 250);
  --primary: oklch(0.55 0.25 255); /* Indigo/Blue gradient core */
  /* ... */
}
```
- **Primary**: Được sử dụng cho các hành động chính (Button mặc định, Ring focus).
- **Secondary**: Dành cho hành động phụ, button phụ.
- **Muted**: Dành cho text bổ sung, border mờ.
- **Destructive**: Dành cho thao tác nguy hiểm (Xoá, Hủy).

## Design System Showcase Page
Mọi component tiêu chuẩn có thể được xem trước tại trang: **`/design-system`** (Khởi động app và truy cập đường dẫn này).

## Danh Sách Các Core Components (shadcn)
1. **Button** (`src/components/ui/button.jsx`): Nút bấm với các variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`.
2. **Badge** (`src/components/ui/badge.jsx`): Nhãn trạng thái (New, Active, Hot, Warm).
3. **Card** (`src/components/ui/card.jsx`): Vùng chứa thông tin. Kết hợp class `glass` để tạo hiệu ứng mờ ảo.
4. **Input & Select**: Component nhập liệu chuẩn, tự động xử lý trạng thái focus, error, disabled.
5. **Dialog & Sheet**:
   - `Dialog`: Dùng cho Modal pop-up xuất hiện ở giữa màn hình (Ví dụ: Xác nhận xoá).
   - `Sheet`: Dùng cho Bottom Sheet vuốt từ dưới lên (Thiết kế ưu tiên cho Mobile, ví dụ: CompletionSheet).

## Custom Business Components (Kế thừa từ Core)
1. **FocusCard**: Thẻ ưu tiên cỡ lớn, kết hợp `Card` + `Badge` + Glassmorphism. Hỗ trợ sự kiện chuột và cảm ứng để nhận diện tương tác vuốt (Tinder Swipe). Chặn text-selection (`select-none`) để vuốt mượt trên PC.
2. **RadarCard**: Thẻ ưu tiên cỡ nhỏ. Cũng được đồng bộ hỗ trợ Swipe trái/phải như FocusCard.
3. **CompletionSheet**: Mở rộng từ `Sheet` (Bottom) kết hợp thao tác Swipe-to-complete.
4. **ScrollChipSelect**: Nút tùy chọn dạng thanh vuốt ngang (Horizontal Chips). Tối ưu hóa tuyệt đối cho mobile thay vì dùng thẻ `<select>` gốc của HTML gây giật/chắn màn hình. Có tích hợp logic màu sắc riêng cho HeatLevel.
5. **Horizontal Weekly Calendar**: Giao diện Lịch dạng vuốt ngang theo từng ngày, tiết kiệm không gian chiều dọc trên mobile, kết hợp hệ thống dot indicator (dấu chấm nhắc lịch).
6. **TagManager** *(mới)*: Component quản lý tag tùy chỉnh trong modal chi tiết khách hàng. Hiển thị tag chips kèm nút xóa (X) và input thêm tag mới (Enter hoặc nút +). Tự động deduplicate. Tags cũng hiển thị trên list cards (max 3, với `+N` overflow).
7. **DashboardStatsPanel** *(mới)*: Panel KPI mở rộng trên Dashboard với 4 cards glass (Quá hạn, Hẹn hôm nay, Chốt tháng, Tổng active) + biểu đồ phễu bán hàng (Sales Funnel) dạng horizontal bar chart, 6 giai đoạn với mã màu riêng.
8. **InteractionTimeline** *(mới)*: Tab "Lịch sử" trong modal khách hàng, merge data từ bảng `Interaction` và `Note`, hiển thị dạng timeline dọc với icon phân biệt (note/interaction) và dòng kết nối.
9. **ScheduleActionModal** *(mới)*: Bottom sheet xuất hiện khi click lịch hẹn, hiển thị thông tin khách + nút Gọi/Zalo/Xem chi tiết.

## Animations
| Tên Class | Hiệu ứng | Thời gian |
|---|---|---|
| `animate-slide-up` | Trượt từ dưới lên | 0.4s |
| `animate-fade-in-up` | Trượt từ dưới lên + Mờ dần rõ | 0.5s |
| `animate-fade-out-left`| Trượt trái + Biến mất | 0.35s |
| `animate-fade-in-right`| Trượt từ phải vào | 0.4s |
| `animate-celebration` | Phóng to nhỏ ăn mừng | 0.6s |
| `animate-pulse` | Chớp nháy nhẹ (Tailwind mặc định)| |

## UI Background & Vibe (Real-Estate/Corporate)
Để mang lại cảm giác xịn xò, đáng tin cậy của một app CRM cho dân sales bất động sản, nền tảng sử dụng kỹ thuật:
- **City Skyline Gradient**: Dùng một hình ảnh thành phố (`public/bg-city.png`) đặt cố định ở góc trên phải. Áp dụng thuộc tính `mix-blend-multiply` và `mask-image` (để mờ dần xuống) giúp hòa quyện liền mạch với nền.
- **Abstract Light Waves**: Các khối tròn ảo cực to (`w-[70%] blur-[120px]`) làm background điểm xuyết các vùng ánh sáng xanh bồng bềnh, tạo chiều sâu 3D phía sau Glass Card.
- **Instant Prefetch Navigation**: Thanh `BottomNav` sử dụng Component `<Link>` của Next.js (thay vì `router.push`), kết hợp prefetching để các trang render soft-load ngay lập tức không có độ trễ giật cục.
