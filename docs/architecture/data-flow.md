# Data Flow
**Dự án:** SalesPush CRM MVP

## 1. Data Fetching (Lấy dữ liệu)
- Lấy dữ liệu thông qua **Next.js Server Components** kết hợp **Prisma Client**.
- Server Components sẽ fetch trực tiếp dữ liệu từ Supabase PostgreSQL trong môi trường an toàn (backend) trước khi render HTML gửi xuống client.
- Lợi ích: SEO tuyệt đối, tối ưu hóa TTI (Time to Interactive), và bảo vệ chuỗi kết nối.

## 2. Optimistic UI Updates (Cập nhật giao diện tức thì)
Khi Sale thay đổi trạng thái của khách (VD: Từ `Mới` sang `Đang chăm`):
1. **Frontend:** Cập nhật ngay lập tức `state` trên màn hình để tạo cảm giác mượt mà (không độ trễ) cho Sale.
2. **Background:** Gọi **Server Action** ngầm, Server Action này sẽ dùng Prisma để chạy lệnh `update` xuống DB.
3. **Error Handling:** Nếu Server báo lỗi, giao diện sẽ rollback lại trạng thái cũ và hiển thị Toast thông báo.

## 3. Query Performance Patterns
- **Dashboard:** Tất cả 12 count queries chạy song song qua `Promise.all()` thay vì tuần tự.
- **Schedule:** Client state đồng bộ với server props qua `useEffect`. Khi hoàn thành lịch hẹn, khách bị xóa khỏi list ngay (optimistic) trước khi `router.refresh()`.
- **Notifications:** Auto-cleanup noti > 5 ngày mỗi lần load trang.
- **Indexes:** 11 composite indexes trên 6 bảng đảm bảo mọi query chạy index lookup thay vì full scan.
