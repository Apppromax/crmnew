# Tái thiết kế Landing Page (Light Mode Premium)

## 1. Phong Cách Thiết Kế (Aesthetics)
- **Chủ đạo**: Light Mode, Minimalist, "Apple-like".
- **Màu sắc**: Trắng tinh khiết (#ffffff), Xám nhạt (#f8fafc) làm nền. Chữ đen mờ (#0f172a). Các điểm nhấn sử dụng gradient tinh tế (Xanh dương - Tím pastel).
- **Vật liệu (Materials)**: Glassmorphism (Kính mờ) cho các thẻ (cards) và thanh điều hướng (navbar). Drop shadow mềm mại.

## 2. Animation & Interaction (Framer Motion)
- **Scroll-triggered**: Các section sẽ trượt nhẹ từ dưới lên (fade-up) và rõ dần (opacity) khi cuộn chuột tới.
- **Micro-interactions**: Nút bấm nảy nhẹ (spring scale) khi hover. Các thẻ tính năng nổi bật lên (lift up) và phát sáng viền.
- **Interactive Background**: Hình nền đồ họa 3D abstract có hiệu ứng parallax nhẹ khi cuộn trang.

## 3. Cấu trúc nội dung (Content Structure)
1. **Hero Section**: 
   - Tiêu đề bắt mắt: "Chốt sales nhanh hơn bao giờ hết."
   - Nút Call to Action (Bắt đầu miễn phí / Khám phá tính năng).
   - Đồ họa trung tâm: Hình ảnh mockup Dashboard UI cao cấp.
2. **How it works (Cách hoạt động)**:
   - Quy trình 3 bước trực quan (Nhập liệu AI -> Phân tích -> Chốt đơn).
3. **Features (Tính năng cốt lõi)**:
   - Smart Card, Quản lý bằng vuốt/chạm, Nhắc nhở tự động. Trình bày dưới dạng bento grid.
4. **Testimonials (Đánh giá)**:
   - Các trích dẫn từ khách hàng (Social proof).
5. **Pricing / CTA (Bảng giá)**:
   - Gói Miễn phí & Gói Pro.
6. **Footer**:
   - Bản quyền & Liên kết.

## 4. Assets
- Hình ảnh Mockup Dashboard CRM (`/images/crm-mockup.png`).
- Đồ họa 3D Abstract Background (`/images/abstract-bg.png`).

Đang tiến hành triển khai mã nguồn tại `src/components/LandingPage.js`.
