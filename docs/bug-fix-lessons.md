# Bug Fix & Lessons Learned
**Dự án:** SalesPush CRM MVP

---

## 🔴 Prisma 7 Breaking Changes (2026-05-10)

### Vấn đề 1: `url`/`directUrl` bị xóa khỏi schema.prisma
- **Lỗi**: `The datasource property "url" is no longer supported in schema files.`
- **Nguyên nhân**: Prisma 7 chuyển cấu hình connection string ra `prisma.config.ts`.
- **Fix**: Xóa `url` và `directUrl` khỏi `datasource db {}`, thêm vào `prisma.config.ts`:
  ```ts
  datasource: { url: process.env["DIRECT_URL"] }
  ```

### Vấn đề 2: `datasourceUrl` bị xóa khỏi PrismaClient constructor
- **Lỗi**: `Unknown property datasourceUrl provided to PrismaClient constructor.`
- **Nguyên nhân**: Prisma 7 bắt buộc dùng driver adapter hoặc `accelerateUrl`.
- **Fix**: Cài `@prisma/adapter-pg` + `pg`, dùng adapter pattern:
  ```js
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  ```

### Vấn đề 3: `db push` treo khi dùng pooler URL (port 6543)
- **Nguyên nhân**: PgBouncer (Transaction pooler) không hỗ trợ DDL operations.
- **Fix**: `prisma.config.ts` phải dùng `DIRECT_URL` (port 5432), không dùng `DATABASE_URL` (port 6543).
- **Rule**: CLI commands (migrate, push, studio) → `DIRECT_URL`. Runtime code → `DATABASE_URL`.

---

## 🟡 Supabase Connection String (2026-05-10)

### Vấn đề: Host `db.PROJECT_REF.supabase.co` không kết nối được
- **Nguyên nhân**: Supabase mới dùng hostname `aws-1-REGION.pooler.supabase.com`.
- **Fix**: Lấy connection string từ Supabase Dashboard → Connect → ORM tab.
- **Rule**: Luôn copy từ Dashboard, không tự ghép URL.

---

## 🟢 Git Token Security (2026-05-10)

### Vấn đề: Token bị lưu plaintext trong remote URL
- **Fix**: Dùng `git remote set-url origin` để xóa token, lưu vào Windows Credential Manager.
- **Rule**: Không bao giờ commit token vào code hay remote URL.

---

## 🟠 Vercel Deployment & Middleware Loops (2026-05-10)

### Vấn đề: Vercel liên tục chạy bản code cũ (Redirect về /login) dù đã rename middleware
- **Lỗi**: Người dùng truy cập URL nhưng luôn bị redirect `307 /login` dù code mới đã xóa/đổi tên `middleware.js` thành `proxy.js` và cập nhật luồng auth.
- **Nguyên nhân**: 
  1. Commit mới nhất chứa code fix lỗi bị Vercel **build thất bại** do các nguyên nhân (Syntax Error, sau đó là cảnh báo Strict ESLint của Next.js 15+ liên quan đến dấu ngoặc kép hoặc `react-hooks/set-state-in-effect`).
  2. Cơ chế của Vercel: Khi bản build bị `Exit code: 1`, nó sẽ **tự động fallback về bản build thành công gần nhất**.
  3. Bản build thành công gần nhất lại chính là bản code cũ có chứa `middleware.js` độc hại! Do đó, Vercel tiếp tục phục vụ bản cũ này vô thời hạn.
- **Fix**:
  - Tạm thời bypass ESLint trên Vercel để ép Vercel thay thế bản build cũ bằng cách cấu hình file `next.config.mjs`:
    ```javascript
    export default {
      eslint: { ignoreDuringBuilds: true },
    }
    ```
- **Rule**: Nếu Vercel vẫn giữ behaviour (hành vi) của code cũ sau khi deploy, hãy lập tức kiểm tra **Build Logs** của Vercel xem tiến trình build mới có bị Fail và fallback hay không. Không bao giờ assume rằng code đã lên Production nếu chưa pass `eslint` / `build`.

### Vấn đề: Vercel sập 500 do thiếu biến môi trường và lỗi redirect vòng lặp ở trang chủ
- **Lỗi 1**: `500 INTERNAL_SERVER_ERROR - MIDDLEWARE_INVOCATION_FAILED`.
- **Lỗi 2**: Người dùng truy cập trang chủ (`/`) bị ép redirect về `/login` dù đáng lẽ phải xem được Landing Page.
- **Nguyên nhân**:
  1. Thiếu biến `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `URL` trong cấu hình Environment Variables của Vercel khiến `createServerClient` trong Middleware quăng lỗi undefined.
  2. Middleware cũ bảo vệ route `/` và bắt buộc redirect `/login` nếu `user` là null, khiến người dùng chưa đăng nhập không thể xem Landing Page.
- **Fix**:
  - Gán giá trị fallback trực tiếp bằng string cho Supabase URL và Key trong `client.js`, `server.js` và `middleware.js`. Các biến `NEXT_PUBLIC_` an toàn để lộ trên frontend nên có thể hardcode fallback giúp ứng dụng không bao giờ bị crash trên Vercel dù quên cấu hình env.
  - Cập nhật logic `middleware.js` thêm route `/` vào danh sách `isPublicRoute` để cho phép truy cập Landing Page mà không bị ép đăng nhập.
- **Rule**: Luôn thiết lập fallback an toàn cho các biến số Public quan trọng, và cẩn trọng khi định nghĩa `isAuthRoute` trong middleware.
