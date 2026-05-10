# Tech Stack
**Dự án:** SalesPush CRM MVP

## Core Stack
- **Framework:** Next.js (App Router)
- **Language:** JavaScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Hosting:** Vercel

## Key Decisions
- **Why Next.js?** Tối ưu SEO, dễ dàng deploy trên Vercel, chia component tốt.
- **Why Supabase + Prisma?** Supabase cung cấp PostgreSQL cực kỳ mạnh mẽ. Prisma ORM giúp việc quản lý Schema trở nên trực quan, sinh Type an toàn, và dễ dàng query dữ liệu từ Server-side, bảo mật hơn nhiều so với việc gọi trực tiếp API từ Client.
- **Why Tailwind CSS 4?** Cấu hình cực kỳ tinh gọn (`@theme`), tốc độ build nhanh, code sạch.
