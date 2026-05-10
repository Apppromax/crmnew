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
