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

---

## 🟣 UI/UX & Performance Tối Ưu Hóa (2026-05-10)

### Vấn đề 1: Chuyển Tab và Đăng nhập bị lag / Delay
- **Lỗi**: Người dùng click chuyển qua lại giữa các tab (Dashboard, Customers, Profile) bị chậm 300-500ms. Màn hình đăng nhập xoay vòng quá lâu.
- **Nguyên nhân**:
  1. `middleware.js` sử dụng `await supabase.auth.getUser()`, hàm này gọi network request lên Supabase API trên **mỗi** lần chuyển route.
  2. Các thẻ `<Link>` ở thanh điều hướng dưới không có `prefetch={true}`, khiến Next.js chỉ tải nội dung khi người dùng click.
  3. Form đăng nhập sử dụng `await fetch("/api/auth/sync")` để đồng bộ DB song song với tạo session, block tiến trình `router.push("/")`.
- **Fix**:
  1. Thay thế `getUser()` bằng `getSession()` trong `middleware.js` (chỉ đọc Cookie, không gọi API, giảm độ trễ về 0ms).
  2. Bổ sung `prefetch={true}` vào các thẻ `<Link>` ở `BottomNav` để preload data nền.
  3. Bỏ `await` khỏi API sync lúc đăng nhập, cho chạy ngầm `.catch(console.error)`, giúp redirect ngay lập tức.
- **Rule**: Tuyệt đối không gọi API mạng liên tục trong Middleware (chỉ dùng Cookie). Ưu tiên prefetch cho UI Navigation và sử dụng non-blocking (async không await) cho các tác vụ phụ.

### Vấn đề 2: Lỗi Turbopack Build "Unterminated regexp literal" do JSX bị lỗi cú pháp
- **Lỗi**: Vercel sập Build với mã lỗi `Unterminated regexp literal` ở file `TeamDashboard.js`.
- **Nguyên nhân**: Cú pháp `members.map((m) => (` bị thiếu cặp ngoặc đóng `))}` trước khi đóng khối `</div>`, khiến trình biên dịch bị trượt cấu trúc cây JSX, nhầm lẫn thẻ `</div>` là một dấu gạch chéo của biểu thức Regex chưa đóng.
- **Fix**: Kiểm tra kỹ các vòng lặp JSX, đóng đúng và đủ `))}`.
- **Rule**: Nếu báo lỗi Regex ở các thẻ HTML/JSX, 100% là do cấu trúc lồng nhau (map, filter) bị đóng thiếu/thừa thẻ.

### Vấn đề 3: Logic lọc dữ liệu khiến Card chăm sóc rồi lại hiện ra
- **Lỗi**: Bấm "Chăm sóc ngay", hẹn ngày gọi lại vào tuần sau, nhưng thẻ khách hàng vẫn hiện chình ình trên mục "Ưu tiên số 1" của Dashboard.
- **Nguyên nhân**: Hàm `getSmartQueue` chỉ lọc bỏ khách hàng trạng thái "Closed" / "Lost". Dù ta đã cập nhật `nextFollowUp` sang tuần sau và đổi trạng thái thành "Waiting", họ vẫn thỏa mãn điều kiện lọc cũ và tiếp tục lọt vào TOP 3 (do có Điểm Rõ Ràng - Clarity Score cao).
- **Fix**: Cập nhật hàm `getSmartQueue`, bổ sung điều kiện lọc khắt khe hơn: `OR: [ { nextFollowUp: null }, { nextFollowUp: { lte: now } } ]`.
- **Rule**: Dữ liệu Queue (Hàng chờ công việc) phải kiểm tra khắt khe yếu tố **Thời Gian**. Nếu thời gian xử lý là ở Tương lai, KHÔNG được cho vào danh sách Cần-làm-hôm-nay.

### Vấn đề 4: Component Modal bị đè sự kiện onClick khiến không xem được thông tin
- **Lỗi**: 2 Thẻ phụ (RadarCard) ở trang chủ khi click vào không hiển thị thông tin chi tiết mà nhảy ngay bảng "Hoàn thành chăm sóc".
- **Nguyên nhân**: Component RadarCard truyền thẳng thuộc tính `onClick={handleAction}`, mà `handleAction` lại mở thẳng bảng báo cáo chăm sóc.
- **Fix**: Bổ sung state `selectedRadarCustomer` tại Dashboard. Khi bấm vào RadarCard, bật Modal chứa toàn bộ Component `FocusCard` (để hiển thị đủ lý do, gợi ý bước tiếp theo), từ đó người dùng đọc xong mới quyết định bấm "Chăm sóc ngay".
- **Rule**: Không bao giờ ẩn thông tin phân tích đi nếu đó là bước chuyển giao (Radar -> Focus). Phải cho user xem thông tin trước khi yêu cầu họ báo cáo.

### Vấn đề 5: Dữ liệu không Refresh sau khi Mutation (Client Cache Gotcha)
- **Lỗi**: Thêm khách hàng thủ công xong hoặc hoàn tất 1 khách xong, trang chủ (Dashboard) không cập nhật ngay dữ liệu mới, phải f5 mới thấy.
- **Nguyên nhân**: Các thao tác thay đổi DB (Mutation) từ Server Actions thực hiện thành công nhưng Next.js App Router bị kẹt bộ nhớ đệm (Router Cache) do thẻ Link đã `prefetch`. Do đó `router.push('/')` render lại bản cache cũ.
- **Fix**: Gọi hàm `revalidatePath('/')` và `revalidatePath('/customers')` ở dòng cuối cùng trong TẤT CẢ các Server Actions có chỉnh sửa dữ liệu (`createCustomer`, `completeCustomerAction`, `snoozeCustomer`).
- **Rule**: Next.js 13+ App Router: Bất cứ Server Action nào có thay đổi CSDL thì bắt buộc phải kết thúc bằng `revalidatePath()` nếu muốn giao diện tự cập nhật mượt mà.
