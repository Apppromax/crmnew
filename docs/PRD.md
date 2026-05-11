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
2. **Quản lý Trạng thái 6 Bước:** Mới → Đang chăm → Đang chờ → Ngủ đông → Đã chốt / Mất khách.
3. **Độ nét Khách hàng (4 cấp):** Rất nét → Tiềm năng → Đang tìm hiểu → Mờ. Thay thế hoàn toàn khái niệm "Độ nóng" (Hot/Warm/Cold).
4. **Hành trình Khách hàng (6 giai đoạn):**
   - 1. Phá băng và làm rõ nhu cầu
   - 2. Tư vấn sản phẩm
   - 3. Xây dựng lòng tin
   - 4. Hẹn gặp/xem
   - 5. Xử lý từ chối
   - 6. Chốt giao dịch
5. **Bảng điều khiển Hành động (Smart Queue):** Thuật toán tự động sắp xếp và đẩy lên Top các khách hàng cần ưu tiên tương tác nhất trong ngày.
6. **Lịch hẹn (Schedule):** Lịch vuốt ngang 14 ngày, nhóm theo giờ. Nhấn hoàn thành → toast thành công + xóa khỏi list ngay.
7. **Dự án / Khu vực (Tags):** Sale tự tạo category (tên dự án, khu vực) gắn label cho khách để nhóm và lọc.
8. **AI Engine:** Thống kê Rất nét / Tiềm năng / Đang tìm hiểu + Mờ. Biểu đồ phễu hành trình.
9. **Admin Dashboard:** Quản lý users, duyệt nạp tiền, cấu hình tài khoản ngân hàng.
10. **Smart Notifications:** Tự động cảnh báo khách "Rất nét" bị bỏ quên > 3 ngày, nhắc lịch hẹn hôm nay. Auto-cleanup sau 5 ngày.

## 4. Trải nghiệm người dùng (UI/UX)
- Chế độ hiển thị: Hỗ trợ tự động Dark mode / Light mode theo hệ thống.
- Ngôn ngữ thiết kế: Hiện đại, viền mượt, hiệu ứng Glassmorphism (Kính mờ) tạo sự chuyên nghiệp.
- Cấu trúc màn hình: Thanh điều hướng nằm dưới cùng (Bottom Navigation) chuẩn Mobile App.
- Ngôn ngữ giao diện: **100% Tiếng Việt** (trạng thái, độ nét, hành trình, nhãn, gợi ý).

## 5. Performance & Scalability
- 11 database indexes trên 6 bảng cho mọi query pattern chính.
- Dashboard queries chạy song song (Promise.all) thay vì tuần tự.
- Notification auto-cleanup 5 ngày → giảm 90% dung lượng bảng.
- Kiến trúc sẵn sàng cho 1,000+ users đồng thời.
