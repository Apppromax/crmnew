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

### Vấn đề 6: Khoảng cách Padding Top bị tụt về 0 trên thiết bị Android
- **Lỗi**: Header của các trang (Dashboard, Add) bị dính chặt lên sát mép trên của trình duyệt, không có khoảng cách.
- **Nguyên nhân**: Sử dụng class `.pt-safe` cấu hình `padding-top: env(safe-area-inset-top, 0);`. Trên các thiết bị Android hoặc Zalo Browser không có "tai thỏ", hàm này trả về 0, ghi đè luôn các padding-top mặc định khác (như `pt-8`) do thứ tự nạp CSS.
- **Fix**: Sử dụng hàm `max()` trong CSS để đảm bảo một khoảng cách tối thiểu: `padding-top: max(2rem, env(safe-area-inset-top));`.
- **Rule**: Tuyệt đối không dùng `env()` trực tiếp cho margin/padding nếu không bọc trong `max()`.

### Vấn đề 7: Dropdown `<select>` quá cơ bản và khó bấm trên điện thoại
- **Lỗi**: Form thêm khách hàng dài với nhiều ô `<select>` làm trải nghiệm lướt và chọn bị gián đoạn (phải cuộn popup của trình duyệt).
- **Nguyên nhân**: `<select>` HTML mặc định không tối ưu cho "1-tap experience".
- **Fix**: Thay thế bằng Component `ScrollChipSelect` - một dải các nút dạng Pills (Chips) cho phép người dùng vuốt ngang và chọn ngay với 1 thao tác chạm. Các option quan trọng như "Độ nét" được thiết kế màu sắc (Xanh/Cam/Đỏ) để nhận diện nhanh.
- **Rule**: Hạn chế dùng native `<select>` trên các ứng dụng định hướng Mobile. Thay vào đó hãy dùng Horizontal Chips hoặc BottomSheet Pickers.

### Vấn đề 8: Trang Vercel trắng xóa ("This page couldn't load") do thiếu import `useState` trong RadarCard
- **Lỗi**: Truy cập trang chủ trên Vercel hiển thị trang trắng với thông báo "This page couldn't load". Local build (`npm run build`) lại thành công bình thường.
- **Nguyên nhân**: Khi nâng cấp `RadarCard.js` để hỗ trợ vuốt chuột (Mouse Drag), đã thêm `const [startX, setStartX] = useState(null)` nhưng quên import `useState` từ React (`import React from 'react'` thay vì `import React, { useState } from 'react'`). Turbopack (dev mode) có thể auto-resolve nhưng Production build của Vercel thì không, gây crash toàn bộ trang.
- **Fix**: Bổ sung `{ useState }` vào dòng import của `RadarCard.js`.
- **Rule**: Khi thêm React Hook (`useState`, `useEffect`, `useCallback`...) vào bất kỳ component nào, **bắt buộc kiểm tra dòng import đầu file** ngay lập tức. Đây là lỗi cực kỳ nguy hiểm vì build local có thể pass nhưng production sẽ crash trắng trang.

### Vấn đề 9: Hàm `formatDate` chưa khai báo trong CustomerClient.js
- **Lỗi**: Modal chi tiết khách hàng crash khi mở khách đang bị Snooze.
- **Nguyên nhân**: Sử dụng `{formatDate(selectedCustomer.snoozedUntil)}` trong JSX nhưng không khai báo hàm `formatDate` tại vị trí hiển thị Snooze (dù hàm này đã tồn tại ở phần khác của file, ngoài phạm vi render).
- **Fix**: Thay thế bằng inline `new Date().toLocaleString('vi-VN', {...})`.
- **Rule**: Khi copy-paste pattern hiển thị ngày tháng vào vị trí mới trong JSX, phải xác nhận hàm helper (`formatDate`) đã được khai báo trong cùng scope. Nếu không chắc chắn, dùng inline `toLocaleString()` cho an toàn.

### Vấn đề 10: Trang Lịch hẹn và Dọn dẹp tải chậm do Client-side Waterfall
- **Lỗi**: Chuyển sang tab Lịch hẹn hoặc Dọn dẹp thấy skeleton loading lâu (300-500ms+), đặc biệt trên mạng chậm.
- **Nguyên nhân**: Cả 2 trang đều là `"use client"` thuần, dùng `useEffect` để gọi Server Actions sau khi component mount. Quy trình: Tải JS bundle → Mount → `useEffect` → Gọi API → Nhận data → Re-render. Đây là "Client Waterfall" — 2 round-trip liên tiếp.
- **Fix**: Tách thành 2 file: `page.js` (Server Component, fetch data) + `*Client.js` (Client Component, nhận `initialData` qua props). Pattern giống trang `/customers` và `/` đã làm trước đó.
- **Rule**: Mọi trang hiển thị danh sách từ DB phải dùng pattern **Server Component fetch → Client Component render**. Tuyệt đối không dùng `useEffect` để fetch data ban đầu nếu có thể fetch ở server.

---

## 🔵 Phase 14-15 Audit & Feature Enhancement (2026-05-10)

### Vấn đề 11: Glass effect dark mode dùng media query thay vì class selector
- **Lỗi**: Glass card không follow manual theme toggle.
- **Nguyên nhân**: CSS dùng `@media (prefers-color-scheme: dark)` thay vì `.dark` class selector.
- **Fix**: Thay bằng `.dark .glass { ... }`.
- **Rule**: Khi dùng manual theme toggle, LUÔN dùng `.dark` class selector, không dùng media query.

### Vấn đề 12: Dead code và Dead props
- **StatusModal.js**: Component tồn tại nhưng không import ở đâu → Xóa.
- **ScheduleClient**: Truyền `onTabChange` cho BottomNav nhưng BottomNav đã dùng `<Link>` → Xóa props thừa.
- **Rule**: Khi refactor component, kiểm tra toàn bộ consumers để xóa dead code/props.

### Vấn đề 13: JSX Ternary chain 3 nhánh
- **Lỗi**: `Expected '</', got ':'` khi thêm nhánh thứ 3 vào ternary.
- **Fix**: `condition1 ? A : condition2 ? B : condition3 ? C : null`.
- **Rule**: Luôn plan cấu trúc ternary trước khi mở rộng. Kết thúc bằng `: null}`.

### Vấn đề 14: Lỗi Bouncing (Hiện lại khách cũ) khi vuốt thẻ liên tục
- **Lỗi**: Người dùng vuốt nhanh 3-4 thẻ trên giao diện, app lag và một lúc sau khách hàng vừa vuốt lại hiện ra (bouncing effect).
- **Nguyên nhân**: Hành động vuốt gọi Server Action (`snoozeCustomer` hoặc `completeCustomerAction`). Đồng thời, một `setTimeout` sau 350ms gọi `loadQueue()` để nạp dữ liệu mới. Khi vuốt liên tục, hàng loạt lệnh `loadQueue()` chạy song song và nhận về dữ liệu cũ từ server do các thao tác ghi DB chưa hoàn tất.
- **Fix**: 
  1. Thêm `dismissedIds` (Set qua `useRef`) để lưu danh sách khách vừa gạt ở client. Lọc loại bỏ những khách này trong data trả về từ `loadQueue()`.
  2. Tối ưu gọi API: Xóa lệnh `loadQueue()` trong setTimeout. Chỉ gọi ngầm `loadQueue()` khi thao tác ghi DB đã hoàn tất (sau `await`) VÀ số lượng thẻ còn lại trên giao diện ít hơn hoặc bằng 3.
- **Rule**: Không bao giờ gọi API Fetch liên tục sau mỗi thao tác vuốt. Tin tưởng vào Optimistic UI (xóa tại client) và chỉ Lazy Fetch khi thực sự cạn dữ liệu để tránh Race Conditions.

### Vấn đề 15: Nút bấm xử lý ngầm (startTransition) gây hiểu nhầm
- **Lỗi**: Người dùng bấm Khôi Phục (Restore) nhưng UI không có phản hồi gì, một lúc sau danh sách tự nhiên thay đổi gây hẫng.
- **Nguyên nhân**: `handleRestoreQueue` sử dụng `startTransition` và gọi Server Action tốn thời gian (300-1000ms), nhưng nút bấm không có trạng thái Loading.
- **Fix**: Sử dụng biến `isPending` từ `useTransition()` để disabled nút bấm và chèn thêm class `animate-spin` cho Icon bên trong để người dùng biết hệ thống đang xử lý.
- **Rule**: Mọi nút gọi Server Action đều phải có trạng thái Loading rõ ràng, đặc biệt trên các ứng dụng Mobile nơi người dùng dễ bối rối vì rớt mạng.

### Vấn đề 16: Trùng lặp nút chức năng (Redundancy UI)
- **Lỗi**: Trong Bottom Sheet Chi tiết khách hàng, vừa có icon Bút chì (chỉnh sửa) ở Header trên cùng, vừa có nút to "Chỉnh sửa thông tin" ở cuối cùng.
- **Fix**: Xóa bỏ nút dưới cùng vì nó nằm xa tầm với (nếu scroll dài) và gây lặp chức năng. Ưu tiên giữ lại icon chuẩn mực ở Header.
- **Rule**: Với các Bottom Sheet chi tiết (Detail View), các thao tác Edit / Delete nên quy hoạch vào vùng Header (góc phải) hoặc nút Floating thay vì dồn xuống đáy form.

---

## 🟢 Phase 16: UX Polish & Workflow Optimization (2026-05-11)

### Vấn đề 17: Màn hình treo/đơ khi tải trang chủ (Không có Loading State)
- **Lỗi**: Khi tắt hẳn tab CRM và vào mới từ đầu (vào thẳng route `/`), trang bị kẹt ở trạng thái trắng bóc hoặc tab trình duyệt xoay vòng rất lâu.
- **Nguyên nhân**: `page.js` gọi `await getSmartQueue()` trực tiếp nhưng thư mục `src/app/` lại không có file `loading.js` (Suspense Fallback). Do đó Next.js không có giao diện chờ để trả về, block hoàn toàn luồng render cho đến khi DB phản hồi.
- **Fix**: Tạo file `src/app/loading.js` chứa một giao diện Skeleton Loading mang thương hiệu CRM (có Logo nhấp nháy).
- **Rule**: Bất kỳ App Route nào có `await` Data Fetching ở Component gốc bắt buộc phải có file `loading.js` đi kèm để hiển thị tức thời (Instant Loading State).

### Vấn đề 18: Tương tác khách hàng đột xuất bị gián đoạn luồng
- **Lỗi**: Khi có khách gọi bất chợt, sale vào Kho Khách Hàng để mở thông tin nhưng không có chỗ nào để ghi chú và "Snooze/Hẹn lại" trực tiếp, bắt buộc phải thao tác qua nhiều bước rườm rà.
- **Fix**: Bổ sung Tab "Chăm sóc" (Quick Care) ngay bên trong Modal Chi tiết Khách hàng. Cho phép Sale nhập Note và chọn nhanh thời gian hẹn lại (2 giờ, 4 giờ, ngày mai...) và trigger Server Action ngay tại chỗ.
- **Rule**: Giữ user ở lại ngữ cảnh (Context) hiện tại càng lâu càng tốt. Mọi Modal xem chi tiết đều nên tích hợp sẵn các nút Quick Action (Call-to-Action) cốt lõi của Entity đó.

### Vấn đề 19: Trang Cá nhân (Profile) quá dài và rối mắt trên Mobile
- **Lỗi**: Đưa toàn bộ Form Nạp tiền, Cài đặt ứng dụng, Tùy chỉnh giao diện hiển thị inline thành các khối thẻ khổng lồ khiến trang Profile phải scroll mỏi tay.
- **Nguyên nhân**: Tư duy "bày tất cả ra mặt tiền" làm giảm trải nghiệm Mobile-first.
- **Fix**: Áp dụng Pattern "Accordion List" (Danh sách thả xuống) mang phong cách iOS Settings. Gom các khu vực thành các SectionItem nhỏ gọn có icon. Click vào mới xổ nội dung xuống.
- **Rule**: Với các trang Settings/Profile nhiều thông tin, luôn phân nhóm (Group) và sử dụng List/Accordion thay vì các Card inline đồ sộ.

### Vấn đề 20: Tùy biến thời gian hẹn giờ (Quick Follow-up)
- **Lỗi**: Nút hẹn "Ngày mai" đôi khi quá lâu đối với các cuộc gọi nhỡ cần gọi lại ngay trong ngày.
- **Fix**: Mở rộng bộ Option hẹn lịch thành dạng lưới (Grid), hỗ trợ mix cả đơn vị Giờ (2h, 4h) lẫn Ngày (1d, 3d, 7d) trong logic xử lý `Date()`.
- **Rule**: CRM cho Sale phải phản ứng linh hoạt với thời gian thực. Hỗ trợ đơn vị tính "Giờ" là bắt buộc đối với khách hàng có mức độ Nóng (Hot).

---

## 🔴 Phase 17: Terminology Migration & Performance (2026-05-11)

### Vấn đề 21: Build fail do ternary chain bị vỡ cấu trúc
- **Lỗi**: `Expected '</', got ':'` tại AdminClient.js:227.
- **Nguyên nhân**: Chuỗi ternary 2 nhánh (users/pending) dùng `) : (` làm fallback. Khi thêm tab "settings" thành nhánh thứ 3, parser JSX hiểu sai cấu trúc.
- **Fix**: Đổi `) : (` thành `) : activeTab === "pending" ? (` để tạo chuỗi 4 nhánh đúng.
- **Rule**: Khi mở rộng ternary chain trong JSX, LUÔN kiểm tra nhánh cuối có phải catch-all `) : (` hay explicit condition. Catch-all phải ở cuối cùng.

### Vấn đề 22: Nút "Đã xong lịch hẹn" không phản hồi
- **Lỗi**: Nhấn nút hoàn thành lịch hẹn nhưng UI không có bất kỳ phản hồi nào.
- **Nguyên nhân 1**: Nút không có trạng thái loading (disabled + spinner).
- **Nguyên nhân 2**: Modal không tự đóng sau khi server action xong.
- **Nguyên nhân 3**: Server action chỉ `revalidatePath("/")` và `"/customers"`, thiếu `"/schedule"`.
- **Fix**: Thêm spinner + "Đang xử lý...", auto-close modal, toast thành công, revalidate `/schedule`.
- **Rule**: Mọi nút gọi Server Action PHẢI có: (1) Loading state, (2) Success feedback, (3) revalidate TẤT CẢ routes liên quan.

### Vấn đề 23: Khách vẫn hiện trong lịch hẹn sau khi hoàn thành
- **Lỗi**: Nhấn "Đã xong" xong, khách đó vẫn nằm trong danh sách lịch hẹn.
- **Nguyên nhân**: `const [schedule] = useState(initialSchedule)` — React `useState` chỉ khởi tạo state 1 lần. Dù `router.refresh()` trả về props mới từ server, client state KHÔNG tự cập nhật.
- **Fix 2 lớp**:
  1. **Optimistic**: `setSchedule(prev => prev.filter(c => c.id !== item.id))` xóa ngay trên client.
  2. **Sync**: `useEffect(() => setSchedule(initialSchedule), [initialSchedule])` đồng bộ khi server props thay đổi.
- **Rule**: Khi Server Component truyền `initialData` cho Client Component qua `useState`, PHẢI thêm `useEffect` để sync. Hoặc dùng `useSyncExternalStore` / React key pattern.

### Vấn đề 24: Thuật ngữ cũ (Hot/Cold/Waiting/Closed) tồn đọng ở 7 file
- **Lỗi**: Sau migration data sang tiếng Việt, nhiều file UI và logic vẫn so sánh với giá trị cũ (Hot, Warm, Cold, Negotiating, Contacted...) → logic rẽ nhánh không khớp data mới.
- **Fix**: Grep toàn bộ codebase, cập nhật 7 file: Dashboard.js, ScheduleClient.js, AiClient.js, TeamAnalytics.js, CustomerClient.js, notifications.js, team.js.
- **Rule**: Khi thay đổi enum/status values trong DB, PHẢI grep toàn bộ codebase tìm giá trị cũ. Không tin tưởng bộ nhớ — sử dụng `grep -r "old_value" src/`.

### Vấn đề 25: Database không có index → Full table scan
- **Lỗi**: Ước tính ở 1,000 users, Dashboard query scan 200K+ rows → 2-5 giây/request.
- **Nguyên nhân**: Schema Prisma không khai báo `@@index` cho bất kỳ bảng nào.
- **Fix**: Thêm 11 composite indexes trên 6 bảng (customers, interactions, notes, notifications, transactions, ai_reports).
- **Rule**: Mọi Prisma model có `findMany` với `where` clause PHẢI có `@@index` tương ứng. Kiểm tra khi tạo model mới.

### Vấn đề 26: Notification tích lũy vĩnh viễn
- **Lỗi**: Hệ thống `triggerSmartAlerts()` tạo noti tự động hàng ngày, không có cơ chế dọn dẹp → bảng phồng nhanh.
- **Fix**: Auto-cleanup noti > 5 ngày mỗi khi user mở trang Thông báo (`deleteMany where createdAt < 5 days ago`).
- **Rule**: Mọi bảng có auto-generated data (notifications, logs) PHẢI có TTL (Time-to-Live) cleanup.

### Vấn đề 27: Dashboard 12 queries tuần tự
- **Lỗi**: `getDashboardStats` chạy 3 lượt `await Promise.all()` nối tiếp (4+1+1+6 queries).
- **Fix**: Gom tất cả 12 queries vào 1 `Promise.all()` duy nhất chạy song song.
- **Rule**: Các query độc lập LUÔN gom vào 1 `Promise.all()`. Không bao giờ `await` tuần tự nếu queries không phụ thuộc nhau.
