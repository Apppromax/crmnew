@AGENTS.md

# 🔴 MANDATORY PROTOCOL: QUY TRÌNH PHÁT TRIỂN (ROUTER)

**THÔNG BÁO QUAN TRỌNG DÀNH CHO AI:** 
Trước khi trả lời bất kỳ yêu cầu viết code hoặc thiết kế hệ thống nào của người dùng, bạn **BẮT BUỘC** phải dùng lệnh đọc file (`view_file`) để đọc các tài liệu sau nhằm đảm bảo sự đồng bộ:

1. **Hiểu yêu cầu nghiệp vụ:** Đọc `docs/PRD.md`
2. **Nắm kiến trúc hệ thống:** Đọc toàn bộ thư mục `docs/architecture/` (bao gồm schema, tech-stack, design-system, data-flow).
3. **Hiểu bối cảnh & tiến độ:** Đọc `docs/llms.txt` và `docs/mobile-crm-plan.md`
4. **Kiểm tra bài học kinh nghiệm:** Đọc `docs/bug-fix-lessons.md` để không lặp lại lỗi cũ.
Nếu chưa đọc các file này, NGHIÊM CẤM TỰ Ý VIẾT CODE hoặc TỰ BỊA RA KIẾN TRÚC!

## QUY TRÌNH 4-PHASE BẮT BUỘC
1. **ANALYSIS:** Phân tích kỹ yêu cầu dựa trên `PRD.md`. Hỏi lại user nếu thông tin mập mờ (Socratic Gate).
2. **PLANNING:** Băm nhỏ task vào file Plan (`docs/mobile-crm-plan.md`). Đánh dấu `[ ]` cho task mới.
3. **SOLUTIONING:** Lên giải pháp kiến trúc. Nếu có thay đổi lớn, phải update vào thư mục `docs/architecture/`.
4. **IMPLEMENTATION:** Viết code, test, chạy Checklist Script (Lint, Security). Khi xong đánh dấu `[x]` vào file Plan. Khi gặp bug khó, phải ghi bài học vào `bug-fix-lessons.md`.
