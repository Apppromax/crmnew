# Database Schema
**Dự án:** SalesPush CRM MVP

## Lược đồ CSDL (Prisma 7 Schema)

Cấu trúc CSDL quản lý tập trung qua file `prisma/schema.prisma`. Sử dụng **Prisma 7** với **`@prisma/adapter-pg`** (driver adapter pattern).

### Cấu hình kết nối (prisma.config.ts)
```typescript
// Prisma 7: URL nằm trong prisma.config.ts, KHÔNG trong schema.prisma
datasource: {
  url: process.env["DIRECT_URL"], // Direct connection cho migrations/push
}
```

### Runtime Client (src/lib/prisma.js)
```javascript
// Prisma 7: Dùng adapter thay vì datasourceUrl
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### Schema (3 bảng)

```prisma
model Customer {
  id             String    @id @default(uuid())
  name           String
  phone          String
  status         String    @default("New")
  // AI-Parsed Fields
  budget         String?
  demand         String?
  area           String?
  timeline       String?
  finance        String?
  // Scoring
  clarityScore   Int       @default(0) @map("clarity_score")  // 0-100
  heatLevel      String    @default("Cold") @map("heat_level") // Cold|Warm|Hot
  // Scheduling
  nextFollowUp   DateTime? @map("next_follow_up")
  lastContactAt  DateTime? @map("last_contact_at")
  snoozedUntil   DateTime? @map("snoozed_until")
  // Journey
  journeyStage   String    @default("Lead") @map("journey_stage")
  // Relations
  interactions   Interaction[]
  notes          Note[]
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  @@map("customers")
}

model Interaction {
  id         String   @id @default(uuid())
  customerId String   @map("customer_id")
  customer   Customer @relation(...)
  type       String   // call | meeting | message | note | site_visit
  summary    String?
  outcome    String?
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("interactions")
}

model Note {
  id         String   @id @default(uuid())
  customerId String   @map("customer_id")
  customer   Customer @relation(...)
  rawText    String   @map("raw_text")
  parsed     Boolean  @default(false)
  parsedData Json?    @map("parsed_data")
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("notes")
}
```

## Cơ chế Bảo mật Dữ liệu
- Mọi thao tác DB chạy ở Server (Server Actions) → giấu hoàn toàn connection string.
- Prisma 7 adapter pattern: connection pool quản lý bởi `pg.Pool`.

## Thuật toán Smart Queue
```
ORDER BY:
  1. Overdue (next_follow_up < NOW) → ưu tiên cao nhất
  2. clarity_score DESC → khách rõ nhất
  3. last_contact_at ASC → chưa chăm lâu nhất
  4. next_follow_up ASC → hẹn gần nhất
WHERE: status NOT IN (Closed, Lost) AND (snoozed_until IS NULL OR < NOW)
LIMIT 3
```

---

## 🚀 Kế hoạch Nâng cấp SaaS (Sau MVP)

Dựa trên yêu cầu phát triển thành hệ thống Multi-user (nhiều người dùng), kiến trúc CSDL sẽ được bổ sung các phần sau trong giai đoạn tới:

### 1. Phân quyền và Cô lập Dữ liệu (Multi-tenant - Cá nhân độc lập)
- Tích hợp **Supabase Auth**. Bảng `users` sẽ do Supabase quản lý (`auth.users`).
- Bảng `Profile` mở rộng từ `auth.users` để lưu thông tin như Role (`admin`, `user`), Pro status.
- Bổ sung trường `userId` (`String`) vào các bảng hiện tại: `Customer`, `Interaction`, `Note`.
- Kích hoạt **Row-Level Security (RLS)** trên Supabase: Ai là chủ của Record (dựa vào `userId`) thì mới được Select/Update/Delete. 

### 2. Hệ thống Nạp tiền (Wallet & Transaction)
Vì chọn phương án **Admin nạp thủ công**, sẽ có 2 bảng mới:
- `Wallet`: Lưu số dư `balance` hiện tại của mỗi User.
- `Transaction`: Lưu lịch sử giao dịch (id, userId, amount, type `TOPUP|SPEND`, status, createdAt). Admin thao tác cộng/trừ thì hệ thống ghi nhận vào đây.

### 3. Gói cước Pro (Subscriptions)
- Bảng `Subscription`: Quản lý gói cước của User (tier: `free`|`pro`, startDate, endDate, status).
- Logic Backend: Khi User cố thêm Khách hàng mới, check `Subscription` để biết giới hạn (Free chỉ được 50 khách, Pro được không giới hạn). User có thể dùng số dư `Wallet` để tự kích hoạt `Subscription`.
