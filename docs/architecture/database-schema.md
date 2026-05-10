# Database Schema
**Dự án:** SalesPush CRM MVP

## Lược đồ CSDL (Prisma Schema)

Cấu trúc CSDL sẽ được quản lý tập trung thông qua file `prisma/schema.prisma`.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Customer {
  id                 String    @id @default(uuid())
  name               String
  phone              String
  status             String    @default("New")
  qualificationLevel String?   @map("qualification_level")
  nextFollowUp       DateTime? @map("next_follow_up")
  createdAt          DateTime  @default(now()) @map("created_at")

  @@map("customers")
}
```

## Cơ chế Bảo mật Dữ liệu
- Do sử dụng Prisma, mọi thao tác lấy dữ liệu sẽ chạy ở môi trường Server (Server Components / Server Actions).
- Điều này giúp giấu hoàn toàn logic truy vấn và chuỗi kết nối CSDL (Connection String) khỏi người dùng cuối, đảm bảo độ bảo mật cao nhất.
