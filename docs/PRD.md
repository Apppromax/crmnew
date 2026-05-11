# Product Requirements Document (PRD)
**Dự án:** SalesPush CRM MVP

## 1. Mục tiêu cốt lõi
Xây dựng một ứng dụng CRM di động tinh gọn, mang tính hành động cao. Ứng dụng không chỉ để lưu trữ data mà phải "thúc đẩy" nhân viên sale tương tác với khách hàng thông qua cơ chế thẻ khách hàng (Smart Cards) và nhắc nhở công việc.

## 2. Đối tượng sử dụng
- Nhân viên kinh doanh (Sales).
- Môi trường: Di chuyển nhiều, thao tác ngoài đường bằng điện thoại thông minh.
- Yêu cầu UI: Nhanh, to, rõ ràng, thao tác có thể thực hiện bằng một tay.

## 3. Tính năng cốt lõi (MVP)
1. **Smart Cards:** Hiển thị thông tin khách hàng (Tên, SĐT, Lịch chăm sóc) trực quan, có thẻ màu phân biệt trạng thái.
2. **Quản lý Trạng thái 6 Bước:** Cho phép chuyển đổi nhanh giữa: Mới, Đang chăm, Đang chờ, Ngủ đông, Đã chốt, Mất khách.
3. **Bảng điều khiển Hành động (Action Dashboard):** Thuật toán tự động sắp xếp và đẩy lên Top các khách hàng cần ưu tiên tương tác nhất trong ngày.
4. **Hệ thống xử lý ngoại lệ:** Báo lỗi rõ ràng hoặc (Dự kiến Phase 2) lưu tạm vào Local Storage nếu bị rớt mạng.

## 4. Trải nghiệm người dùng (UI/UX)
- Chế độ hiển thị: Hỗ trợ tự động Dark mode / Light mode theo hệ thống.
- Ngôn ngữ thiết kế: Hiện đại, viền mượt, hiệu ứng Glassmorphism (Kính mờ) tạo sự chuyên nghiệp.
- Cấu trúc màn hình: Thanh điều hướng nằm dưới cùng (Bottom Navigation) chuẩn Mobile App.
