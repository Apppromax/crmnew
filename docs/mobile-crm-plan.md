# Kế hoạch phát triển Mobile CRM (SalesPush MVP)

Tài liệu này xác định các bước phát triển ứng dụng CRM theo quy trình 4-Phase tiêu chuẩn, đảm bảo tính minh bạch, dễ tra cứu và bảo trì.

## 1. Tổng quan dự án
- **Mục tiêu**: Xây dựng ứng dụng quản lý khách hàng (CRM) tinh gọn, tập trung vào việc thúc đẩy hành động (Smart Cards, 6 Trạng thái).
- **Nền tảng**: Web App tối ưu hóa cho thiết bị di động (Mobile-first).
- **Stack công nghệ**: 
  - **Frontend**: Next.js (App Router), React, Tailwind CSS.
  - **Backend/DB**: Supabase (PostgreSQL) + Prisma ORM.
  - **Deploy**: Vercel.
- **Xử lý ngoại lệ**: Hiển thị thông báo khi mất kết nối mạng (cơ chế cơ bản cho MVP).

---

## 2. Quy trình 4-Phase

### Phase 1: Phân tích & Khám phá (Đã hoàn thành)
- [x] Thu thập yêu cầu từ dự án cũ (`d:\CRM`).
- [x] Quyết định sử dụng Next.js & Supabase để dễ scale trên Vercel.
- [x] Chốt yêu cầu giao diện tập trung vào Mobile.

### Phase 2: Lập kế hoạch (Hiện tại)
- [x] Thiết lập tài liệu `mobile-crm-plan.md`.
- [x] Xác định các đầu việc cốt lõi (Task breakdown).

### Phase 3: Kiến trúc & Thiết kế (Solutioning)
*(Lưu ý: Không viết code ở phase này)*
- **3.1 Kiến trúc Cơ sở dữ liệu (Supabase)**:
  - Bảng `customers`: `id`, `name`, `phone`, `status` (New, Active, Waiting, Dormant, Closed, Lost), `qualification_level`, `next_follow_up`, `created_at`.
- **3.2 Cấu trúc Giao diện (UI/UX)**:
  - App layout: Viewport giới hạn cho Mobile, có Bottom Navigation.
  - Components: `SmartCard` (Hiển thị khách hàng), `StatusModal` (Cập nhật trạng thái), `ActionDashboard` (Ưu tiên hiển thị top 3 khách hàng cần tương tác).
- **3.3 Biện pháp bảo mật**: 
  - Cấu hình Row Level Security (RLS) để đảm bảo an toàn dữ liệu.

### Phase 4: Thực thi (Implementation)
*Phần này sẽ được thực hiện sau khi chốt Phase 3.*
- [x] **Step 1**: Khởi tạo dự án Next.js (`npx create-next-app`).
- [x] **Step 2**: Cài đặt Supabase Client và cấu hình biến môi trường (`.env.local`).
- [x] **Step 3**: Thiết lập hệ thống Design System (Tailwind CSS) cho giao diện Mobile.
- [x] **Step 4**: Code UI Components (SmartCard, StatusModal, Dashboard).
- [x] **Step 5**: Viết logic kết nối Supabase (CRUD khách hàng) bằng `@supabase/supabase-js` (Bản nháp).
- [x] **Step 6**: Chạy các kịch bản kiểm tra (UX Audit, Lint) bằng hệ thống Scripts của Antigravity Kit.

### Phase 4.1: Chuyển đổi kiến trúc sang Prisma (Current)
- [ ] **Step 1**: Cài đặt Prisma (`npm i -D prisma` & `npm i @prisma/client`).
- [ ] **Step 2**: Khởi tạo cấu trúc Prisma (`npx prisma init`) và viết schema cho bảng `customers`.
- [ ] **Step 3**: Viết Next.js Server Actions cho chức năng lấy danh sách và cập nhật trạng thái.
- [ ] **Step 4**: Refactor lại component `page.js` để bỏ `@supabase/supabase-js` client-side và chuyển sang gọi Server Actions.
- [ ] **Step 5**: Chạy `npx prisma generate` và test tích hợp.

### Phase 5: Bàn giao
- [ ] Deploy lên Vercel.

### Phase 6: Nâng cấp cốt lõi - Smart Queue & AI Entry (New Epic)
- [ ] **Step 1: AI Data Entry**: Xây dựng UI thêm khách bằng Text/Voice note. Tích hợp AI (LLM API) để tự động bóc tách (Ngân sách, Nhu cầu, Khu vực) và tính toán điểm `Độ nét`.
- [ ] **Step 2: Smart Queue Engine**: Phát triển cơ chế "Focus + Radar" (1 Thẻ chính, 2 Thẻ phụ). Viết query/thuật toán lấy Top 3 ưu tiên dựa trên `Độ nét` và `Lịch hẹn`.
- [ ] **Step 3: Overdue Cleanup Flow**: Thiết kế màn hình "Dọn dẹp" (Cleanup) độc lập dành riêng cho các thẻ quá hạn, tách biệt hoàn toàn khỏi luồng 3 thẻ chính để tránh gây ngợp.
- [ ] **Step 4: 10-Second Completion UI**: Xây dựng Bottom Sheet "Ghi chú nhanh" tối ưu thao tác 1 tay (Text, Quick Date Chips, Swipe to complete).

