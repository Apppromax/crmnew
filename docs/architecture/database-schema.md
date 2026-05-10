# Database Schema
**Dự án:** SalesPush CRM MVP (SaaS Mode)

## Lược đồ CSDL (Prisma 7 Schema)

Cấu trúc CSDL quản lý tập trung qua file `prisma/schema.prisma`. Hệ thống đã được nâng cấp lên kiến trúc **SaaS Multi-tenant**.

### Cấu hình kết nối (prisma.config.ts)
```typescript
// Prisma 7: URL nằm trong prisma.config.ts
datasource: {
  url: process.env["DIRECT_URL"], // Direct connection cho migrations/push
}
```

### Schema (7 bảng chính)

```prisma
model Profile {
  id        String   @id // Map với id của auth.users Supabase
  email     String   @unique
  role      String   @default("user") // "user" | "admin"
  balance   Int      @default(0) // Số dư Credits
  isPro     Boolean  @default(false)
  proUntil  DateTime? @map("pro_until")
  createdAt DateTime @default(now()) @map("created_at")

  customers       Customer[]
  transactions    Transaction[]
  
  ownedTeam       Team?
  teamMembership  TeamMember?

  @@map("profiles")
}

model Customer {
  id             String    @id @default(uuid())
  userId         String?   @map("user_id")
  profile        Profile?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  teamId         String?   @map("team_id")
  team           Team?     @relation(fields: [teamId], references: [id], onDelete: SetNull)
  
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
  clarityScore   Int       @default(0) @map("clarity_score")
  heatLevel      String    @default("Cold") @map("heat_level")
  
  // Scheduling
  nextFollowUp   DateTime? @map("next_follow_up")
  lastContactAt  DateTime? @map("last_contact_at")
  snoozedUntil   DateTime? @map("snoozed_until")
  
  journeyStage   String    @default("Lead") @map("journey_stage")

  interactions   Interaction[]
  notes          Note[]
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@map("customers")
}

model Interaction {
  id         String   @id @default(uuid())
  customerId String   @map("customer_id")
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  type       String   
  summary    String?
  outcome    String?
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("interactions")
}

model Note {
  id         String   @id @default(uuid())
  customerId String   @map("customer_id")
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  rawText    String   @map("raw_text")
  parsed     Boolean  @default(false)
  parsedData Json?    @map("parsed_data")
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("notes")
}

model Transaction {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  profile   Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount    Int
  type      String   // "TOPUP" | "SPEND"
  note      String?
  status    String   @default("COMPLETED")
  createdAt DateTime @default(now()) @map("created_at")
  @@map("transactions")
}

model Team {
  id         String   @id @default(uuid())
  name       String
  inviteCode String   @unique @map("invite_code")
  
  ownerId    String   @unique @map("owner_id")
  owner      Profile  @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  isActive   Boolean  @default(false) @map("is_active")
  validUntil DateTime? @map("valid_until")
  maxMembers Int      @default(5) @map("max_members")
  
  members    TeamMember[]
  customers  Customer[]
  
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("teams")
}

model TeamMember {
  id        String   @id @default(uuid())
  teamId    String   @map("team_id")
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  userId    String   @unique @map("user_id")
  user      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role      String   @default("MEMBER") // "LEADER" | "MEMBER"
  joinedAt  DateTime @default(now()) @map("joined_at")

  @@unique([teamId, userId])
  @@map("team_members")
}
```

## Cơ chế Bảo mật Dữ liệu (SaaS)
- **Authentication**: Xác thực qua Supabase Auth (`@supabase/ssr`).
- **Data Isolation**: Tất cả Server Actions đều tự động lấy `userId` từ token bảo mật và gắn vào/lọc theo các query Prisma (vd: `where: { userId }`). Tuyệt đối không để rò rỉ dữ liệu chéo giữa các Sale.
- **Admin Role**: API nạp tiền và xem danh sách User có hàm check `requireAdmin()` chỉ cho phép user có `role === "admin"`.

## Thuật toán Smart Queue
```
ORDER BY:
  1. Overdue (next_follow_up < NOW) → ưu tiên cao nhất
  2. clarity_score DESC → khách rõ nhất
  3. last_contact_at ASC → chưa chăm lâu nhất
  4. next_follow_up ASC → hẹn gần nhất
WHERE: status NOT IN (Closed, Lost) AND (snoozed_until IS NULL OR < NOW) AND userId = CURRENT_USER
LIMIT 3
```
