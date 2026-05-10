# Bug Fix Lessons
Tài liệu này lưu trữ các bài học khi fix bug để AI và lập trình viên không mắc lại sai lầm trong tương lai.

## 1. Lỗi ESLint với React Hooks trong Next.js
- **Lỗi:** `react-hooks/set-state-in-effect` hoặc `Cannot access variable before it is declared`.
- **Nguyên nhân:** Khai báo hàm fetch dữ liệu bên ngoài `useEffect` bằng biến `const` hoặc khai báo nhưng gọi trước định nghĩa, vi phạm rule nghiêm ngặt của Next.js ESLint.
- **Giải pháp/Bài học:** Luôn ưu tiên khai báo function fetching dữ liệu (như `fetchCustomers`) ở **bên trong** khối `useEffect` để tránh lỗi render và rò rỉ bộ nhớ, hoặc phải bọc hàm bằng `useCallback`.

*(Thêm log mới lên trên cùng nếu gặp bug mới)*
