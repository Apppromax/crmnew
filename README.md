# SalesPush CRM

> CRM thông minh cho sale bất động sản — Chăm đúng khách, đúng lúc.

## 🎯 Mô tả

SalesPush là ứng dụng quản lý khách hàng (CRM) mobile-first, thiết kế riêng cho môi giới bất động sản. Thay vì quản lý thụ động, SalesPush sử dụng **Smart Queue** để tự động đưa khách cần chăm sóc lên đầu, giúp sale tập trung vào hành động. Hệ thống hiện tại đã được nâng cấp lên mô hình **SaaS Multi-tenant**, cho phép nhiều User cùng sử dụng độc lập và an toàn tuyệt đối.

## ✨ Tính năng chính

- **🎯 Focus + Radar Queue**: 1 thẻ khách trọng tâm + 2 thẻ phụ, tự động sắp xếp ưu tiên
- **🤖 AI Data Entry (Gemini 2.5 Flash)**: Paste nguyên đoạn chat của khách vào, AI tự động tách Tên, SĐT, Nhu cầu, Tài chính và chấm "Độ nét".
- **🧠 AI Engine**: Tự động đánh giá hiệu suất, tạo chiến lược chốt sale tuần mới dựa trên tình hình Database hiện tại.
- **🔔 Smart Notifications**: Hệ thống tự động quét và cảnh báo Khách Nóng bị bỏ quên hoặc nhắc nhở lịch hẹn trong ngày.
- **🔒 SaaS Multi-tenant**: Đăng nhập qua Supabase Auth. Dữ liệu của từng Sale được cô lập hoàn toàn.
- **💎 Ví & Gói Pro**: Quản trị viên (Admin) nạp Credits cho User. User dùng Credits nâng cấp gói Pro.
- **👥 Team Mode (B2B)**: Không gian làm việc nhóm trả phí. Leader mua gói, quản lý thành viên, điều phối Lead và xem báo cáo hiệu suất chung.
- **⚡ Tinder Swipe & 10-Second Completion**: Vuốt chạm tương tác vật lý cực mượt (Vuốt trái: Tạm gác, Vuốt phải: Cập nhật). Hỗ trợ cả Touch trên Mobile và Mouse Drag trên PC.
- **🔥 Heat System**: Phân loại khách Hot/Warm/Cold theo Clarity Score (0-100)
- **📊 Smart Sorting**: Thuật toán ưu tiên: Overdue → Score → Last Contact → Next Follow-up
- **🧹 Tùy biến Queue & Snooze**: Khôi phục hàng chờ nhanh chóng, cài đặt thời gian Snooze mặc định theo từng tài khoản.
- **📱 Responsive Layout**: Giao diện linh hoạt tự động chuyển đổi Bottom Nav (Mobile) sang Sidebar (Tablet/PC).
- **📅 Cleanup & Schedule**: Giao diện chuyên biệt quản lý khách quá hạn và lịch hẹn tương lai. Click lịch hẹn → modal hành động nhanh (Gọi/Zalo).
- **✏️ Chỉnh sửa & Xóa Khách hàng**: Edit trực tiếp trong modal chi tiết + xóa vĩnh viễn với confirm dialog.
- **🏷️ Hệ thống Tag tùy chỉnh**: Tạo và gắn tag cho từng khách hàng. Lọc theo tag trên danh sách. Thêm/xóa tag trực tiếp trong modal.
- **📊 Dashboard Mở rộng**: 4 KPI cards (Quá hạn, Hẹn hôm nay, Chốt tháng, Tổng active) + Phễu bán hàng (Sales Funnel) trực quan.
- **📞 Lịch sử tương tác**: Tab "Lịch sử" trong modal khách hàng, hiển thị timeline ghi chú + tương tác.
- **⚙️ Cài đặt sử dụng**: Section riêng trong Profile cho Snooze presets, Follow-up mặc định, Queue size, Xác nhận trước khi gác.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **Backend/DB** | Supabase (PostgreSQL) + Supabase Auth (@supabase/ssr) |
| **ORM** | Prisma 7 + @prisma/adapter-pg |
| **AI** | Google GenAI SDK (Gemini Flash) |
| **Deploy** | Vercel |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Cần cung cấp:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# - DATABASE_URL (Transaction pool)
# - DIRECT_URL (Session/Migrate pool)
# - GEMINI_API_KEY

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run dev server
npm run dev
```

### Hướng dẫn tạo Admin
1. Đăng ký tài khoản trên app.
2. Vào **Supabase Dashboard > SQL Editor**.
3. Chạy lệnh: `UPDATE "profiles" SET "role" = 'admin' WHERE "email" = 'email_cua_ban@gmail.com';`
4. Quay lại app, vào mục **Cá nhân** để thấy nút **Trang Quản trị Admin**.

## 📂 Cấu trúc thư mục cốt lõi

```
src/
├── app/
│   ├── admin/           # Dashboard cho Admin nạp tiền
│   ├── add/             # AI Data Entry
│   ├── customers/       # Kho khách tổng
│   ├── schedule/        # Lịch hẹn
│   ├── cleanup/         # Khách quá hạn
│   ├── profile/         # Cá nhân, mua Pro
│   ├── login/           # Đăng nhập & Đăng ký
│   └── page.js          # Smart Queue
├── actions/
│   ├── ai.js            # Gọi Google Gemini AI
│   ├── admin.js         # API nạp tiền, lấy user
│   ├── user.js          # API mua gói Pro
│   ├── customers.js     # CRUD Khách hàng + Tags + Dashboard Stats
│   └── notifications.js # Smart Alerts & Notification System
├── lib/
│   ├── prisma.js        # Prisma Client singleton
│   └── supabase/        # SSR Client cho Auth
└── proxy.js             # Next.js 16 Middleware bảo vệ routes
```

## 📋 Trạng thái dự án

- ✅ Phase 1-3: Phân tích, Kế hoạch, Kiến trúc
- ✅ Phase 4: Smart Queue UI + Supabase + Prisma 7
- ✅ Phase 5: SaaS Multi-tenant (Auth, Admin, Wallet, Pro)
- ✅ Phase 6: AI Data Entry, Kho khách, Schedule, Cleanup
- ✅ Phase 7: UI/UX Refactor (shadcn, Glassmorphism, Prefetch Navigation)
- ✅ Phase 8: Deploy Vercel thành công
- ✅ Phase 9: Team Mode Module (SaaS B2B, Phân bổ Lead, Thống kê Team)
- ✅ Phase 10: Performance Optimization & Manual Flow (RevalidatePath, Smart Queue Fix, Manual Add Form)
- ✅ Phase 11: UI Refinement & Mobile Experience (Scrollable Chips, Horizontal Calendar Strip, Android Padding Fix)
- ✅ Phase 12: AI Engine & Smart Notifications (Dashboard Chiến lược AI, Bộ lọc thông minh, Tinder Swipe Animation, Background Settings)
- ✅ Phase 13: Cross-platform & Queue Mechanics (Responsive Sidebar PC/iPad, Mouse Drag Tinder Swipe, Custom Snooze Config, Queue Restore)
- ✅ Phase 14: Customer Management Enhancement (Edit/Delete Customer, Interaction History Timeline, Schedule Actions, Settings Restructure)
- ✅ Phase 15: Tag System & Dashboard Extension (Custom Tags, Tag Filter, KPI Dashboard, Sales Funnel Chart, Bug Fixes)
- ✅ Phase 16: Monetization & UX Polish (Admin Manual Top-up Approval Workflow, AI Engine Dashboard Migration, Anti-Bouncing Queue Fix, Loading Indicators)

## 📝 License

Private — Apppromax © 2026
