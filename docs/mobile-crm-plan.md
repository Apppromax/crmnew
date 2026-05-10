# Kế hoạch phát triển Mobile CRM (SalesPush MVP)

Tài liệu này xác định các bước phát triển ứng dụng CRM theo quy trình 4-Phase tiêu chuẩn, đảm bảo tính minh bạch, dễ tra cứu và bảo trì.

## 1. Tổng quan dự án
- **Mục tiêu**: Xây dựng ứng dụng quản lý khách hàng (CRM) tinh gọn, tập trung vào việc thúc đẩy hành động (Smart Cards, 6 Trạng thái).
- **Nền tảng**: Web App tối ưu hóa cho thiết bị di động (Mobile-first).
- **Stack công nghệ**: 
  - **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
  - **Backend/DB**: Supabase (PostgreSQL) + Prisma 7 ORM + `@prisma/adapter-pg`.
  - **Deploy**: Vercel.
- **Xử lý ngoại lệ**: Hiển thị thông báo khi mất kết nối mạng (cơ chế cơ bản cho MVP).

---

## 2. Quy trình 4-Phase

### Phase 1: Phân tích & Khám phá (✅ Hoàn thành)
- [x] Thu thập yêu cầu từ dự án cũ (`d:\CRM`).
- [x] Quyết định sử dụng Next.js & Supabase để dễ scale trên Vercel.
- [x] Chốt yêu cầu giao diện tập trung vào Mobile.

### Phase 2: Lập kế hoạch (✅ Hoàn thành)
- [x] Thiết lập tài liệu `mobile-crm-plan.md`.
- [x] Xác định các đầu việc cốt lõi (Task breakdown).
- [x] Brainstorm 3 phương án UI (Inbox Zero / Endless Feed / Focus+Radar).
- [x] Chốt phương án: **Focus + Radar** (1 thẻ lớn + 2 thẻ nhỏ).
- [x] Thiết kế Completion Flow 10 giây.

### Phase 3: Kiến trúc & Thiết kế (✅ Hoàn thành)
*(Lưu ý: Không viết code ở phase này)*
- **3.1 Kiến trúc CSDL mới (3 bảng)**:
  - `customers`: 20+ trường bao gồm AI-parsed fields, clarity_score, heat_level, journey_stage, snoozed_until.
  - `interactions`: Lịch sử tương tác (type, summary, outcome).
  - `notes`: Ghi chú thô cho AI parse (raw_text, parsed_data).
- **3.2 Thuật toán Smart Queue**: Overdue → Clarity Score → Last Contact → Next Follow-up.
- **3.3 Clarity Score**: Công thức 100 điểm (Budget 20, Demand 20, Timeline 20, Area 15, Interaction 15, Finance 10).
- **3.4 Cấu trúc UI**: Focus Card lớn + 2 Radar Cards + CompletionSheet + BottomNav 4 tab.
- **3.5 AI Entry**: LLM parse note → bóc tách 5 trường → tính score (đề xuất Gemini Flash).

### Phase 4: Thực thi — MVP cơ bản (✅ Hoàn thành)
- [x] **Step 1**: Khởi tạo dự án Next.js (`npx create-next-app`).
- [x] **Step 2**: Cài đặt Supabase Client và cấu hình biến môi trường (`.env.local`).
- [x] **Step 3**: Thiết lập hệ thống Design System (Tailwind CSS) cho giao diện Mobile.
- [x] **Step 4**: Code UI Components (SmartCard, StatusModal, Dashboard).
- [x] **Step 5**: Viết logic kết nối Supabase (CRUD khách hàng) bằng `@supabase/supabase-js` (Bản nháp).
- [x] **Step 6**: Chạy các kịch bản kiểm tra (UX Audit, Lint) bằng hệ thống Scripts.

### Phase 4.1: Chuyển đổi kiến trúc sang Prisma 7 (✅ Hoàn thành)
- [x] **Step 1**: Cài đặt Prisma 7 + `@prisma/adapter-pg` + `pg`.
- [x] **Step 2**: Viết schema 3 bảng (customers, interactions, notes) và push lên Supabase.
- [x] **Step 3**: Viết Next.js Server Actions (`src/actions/customers.js`) cho Queue, Complete, Snooze.
- [x] **Step 4**: Refactor `page.js` từ mock data sang gọi Server Actions (data thật từ Supabase).
- [x] **Step 5**: Seed 5 khách hàng mẫu vào DB.

### Phase 4.2: Smart Queue UI (✅ Hoàn thành)
- [x] **Step 1**: Tạo `FocusCard.js` — Thẻ lớn (avatar, heat badge, reason, next step, info row, CTA, swipe).
- [x] **Step 2**: Tạo `RadarCard.js` — Thẻ nhỏ (tên, heat badge, countdown).
- [x] **Step 3**: Tạo `CompletionSheet.js` — Bottom Sheet 10 giây (note, mic, date chips, swipe-to-complete).
- [x] **Step 4**: Tạo `BottomNav.js` — 4 tab (Hôm nay, Khách hàng, Lịch hẹn, Cá nhân).
- [x] **Step 5**: Tạo `InboxZero.js` — Màn hình chúc mừng khi hết queue.
- [x] **Step 6**: Viết thuật toán Smart Queue (Overdue → Score → Last Contact → Next FollowUp).

### Phase 6: Nâng cấp cốt lõi — Smart Queue & AI Entry
- [x] **Step 1: AI Data Entry**: Xây dựng trang `/add` thêm khách bằng Text/Voice note. Tích hợp AI (LLM API) để tự động bóc tách và tính `Độ nét`.
- [x] **Step 2: Trang Khách hàng**: Xây dựng trang `/customers` — Kho khách tổng (danh sách, tìm kiếm, lọc).
- [x] **Step 3: Overdue Cleanup Flow**: Thiết kế trang `/cleanup` riêng biệt cho các thẻ quá hạn.
- [x] **Step 4: Trang Lịch hẹn**: Xây dựng trang `/schedule` — Calendar view lịch follow-up.

### Phase 5: Bàn giao
- [x] Deploy lên Vercel thành công và sửa lỗi Next.js 16 Proxy.

### Phase 7: SaaS Multi-tenant & Admin features
- [x] **Step 1: Authentication**: Tích hợp Supabase Auth (Đăng nhập, Đăng ký). Thiết lập RLS (Row-Level Security) để bảo mật cấp Database.
- [x] **Step 2: Database Multi-tenant**: Bổ sung trường `userId` vào các bảng (`Customer`, `Interaction`, `Note`) để mỗi tài khoản tự quản lý khách của mình.
- [x] **Step 3: Admin Dashboard**: Xây dựng trang `/admin` (dành riêng cho role admin) để quản lý danh sách User.
- [x] **Step 4: Hệ thống Nạp tiền (Thủ công)**: Tạo bảng `Wallet` và `Transaction`. Admin nhận tiền chuyển khoản và bấm cộng Credits vào ví User.
- [x] **Step 5: Mua tài khoản Pro**: Logic cho phép User dùng Credits để mua gói Pro (mở khóa số lượng khách hàng, tính năng AI...).

### Phase 8: Giao diện và Trải nghiệm (UI/UX Polish) (✅ Hoàn thành)
- [x] **Step 1: shadcn/ui**: Thiết lập thư viện UI với biến CSS oklch (Light/Dark mode).
- [x] **Step 2: Glassmorphism**: Thêm class `.glass` và style các card, sheet.
- [x] **Step 3: Real-estate Vibe Background**: Generate hình thành phố mờ bằng AI và áp dụng mix-blend-mode làm nền để tạo sự sang trọng.
- [x] **Step 4: Prefetch Navigation**: Chuyển BottomNav từ `router.push` sang `<Link>` để loại bỏ hoàn toàn độ trễ khi chuyển tab (instant navigation).
- [x] **Step 5: Unauthenticated Landing Page**: Trang chủ bắt mắt cho user chưa đăng nhập với các nút điều hướng.
- [x] **Step 6: Thêm khách thủ công**: Tính năng Add Manual không dùng AI cho phép thao tác nhanh.
- [x] **Step 7: Chuẩn hóa Design System (Lucide)**: Thay thế toàn bộ thẻ SVG thô và Emoji thành bộ icon chuyên nghiệp của `lucide-react` để đồng bộ hoàn toàn UI.
