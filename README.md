# SalesPush CRM

> CRM thông minh cho sale bất động sản — Chăm đúng khách, đúng lúc.

## 🎯 Mô tả

SalesPush là ứng dụng quản lý khách hàng (CRM) mobile-first, thiết kế riêng cho môi giới bất động sản. Thay vì quản lý thụ động, SalesPush sử dụng **Smart Queue** để tự động đưa khách cần chăm sóc lên đầu, giúp sale tập trung vào hành động.

## ✨ Tính năng chính

- **🎯 Focus + Radar Queue**: 1 thẻ khách trọng tâm + 2 thẻ phụ, tự động sắp xếp ưu tiên
- **⚡ 10-Second Completion**: Bottom sheet ghi chú nhanh + chọn lịch hẹn + swipe hoàn thành
- **🔥 Heat System**: Phân loại khách Hot/Warm/Cold theo Clarity Score (0-100)
- **📊 Smart Sorting**: Thuật toán ưu tiên: Overdue → Score → Last Contact → Next Follow-up
- **🎉 Inbox Zero**: Chúc mừng khi hết khách cần xử lý

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma 7 + @prisma/adapter-pg |
| **Deploy** | Vercel (dự kiến) |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in SUPABASE_URL, DATABASE_URL, DIRECT_URL

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample data
node prisma/seed.mjs

# Run dev server
npm run dev
```

## 📂 Cấu trúc thư mục

```
src/
├── app/
│   ├── globals.css          # Design system (colors, glass, animations)
│   ├── layout.js            # Root layout (SEO, fonts)
│   └── page.js              # Smart Queue page (Focus + Radar)
├── actions/
│   └── customers.js         # Server Actions (Queue, Complete, Snooze, Create)
├── components/
│   ├── FocusCard.js          # Thẻ khách lớn (ưu tiên #1)
│   ├── RadarCard.js          # Thẻ khách nhỏ (tiếp theo)
│   ├── CompletionSheet.js    # Bottom sheet 10 giây
│   ├── BottomNav.js          # 4-tab navigation
│   ├── InboxZero.js          # Inbox Zero celebration
│   ├── SmartCard.js          # Legacy card
│   └── StatusModal.js        # Legacy modal
└── lib/
    └── prisma.js             # Prisma Client singleton (adapter pattern)
prisma/
├── schema.prisma             # Database schema (3 tables)
├── seed.mjs                  # Seed script (5 sample customers)
docs/
├── mobile-crm-plan.md        # Development roadmap
├── PRD.md                    # Product requirements
├── bug-fix-lessons.md        # Lessons learned
└── architecture/
    ├── database-schema.md    # DB design + Smart Queue algorithm
    ├── ui-design-system.md   # Colors, components, animations
    └── tech-stack.md         # Stack decisions + Prisma 7 notes
```

## 📋 Trạng thái dự án

- ✅ Phase 1-3: Phân tích, Kế hoạch, Kiến trúc
- ✅ Phase 4: Smart Queue UI + Supabase + Prisma 7
- 🔲 Phase 6: AI Data Entry, Kho khách, Overdue Cleanup
- 🔲 Phase 5: Deploy Vercel

## 📝 License

Private — Apppromax © 2026
