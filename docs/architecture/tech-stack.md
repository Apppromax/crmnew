# Tech Stack
**Dự án:** SalesPush CRM MVP

## Core Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** JavaScript (React 19)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma 7 + `@prisma/adapter-pg` + `pg`
- **Hosting:** Vercel (dự kiến)

## Key Decisions
- **Why Next.js?** Tối ưu SEO, Server Actions cho data fetching an toàn, deploy dễ trên Vercel.
- **Why Supabase + Prisma 7?** Supabase cung cấp PostgreSQL mạnh mẽ. Prisma 7 sử dụng driver adapter (`@prisma/adapter-pg`) thay vì binary engine → bundle nhỏ hơn 90%, query nhanh hơn.
- **Why Tailwind CSS 4?** Cấu hình `@theme` tinh gọn, tốc độ build nhanh, code sạch.
- **Prisma 7 Breaking Changes:**
  - `url`/`directUrl` trong schema.prisma đã bị xóa → phải dùng `prisma.config.ts`.
  - Constructor PrismaClient bắt buộc `adapter` hoặc `accelerateUrl` → dùng `PrismaPg(pool)`.
  - CLI operations (db push, migrate) dùng `DIRECT_URL` (port 5432), runtime dùng `DATABASE_URL` (pooler, port 6543).
- **Server Actions Error Handling:** Throwing a generic `Error` inside a Next.js Server Action triggers a Digest Error on the client (masking the original message for security). Bắt buộc phải dùng pattern: `try/catch` bên trong Action và return `{ error: "Message" }` để client xử lý.

## Dependencies chính
```json
{
  "@prisma/client": "^7.8.0",
  "@prisma/adapter-pg": "^7.x",
  "pg": "^8.x",
  "next": "16.2.6",
  "react": "19.2.4",
  "tailwindcss": "^4"
}
```
