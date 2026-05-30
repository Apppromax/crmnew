"use server";

import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function parseNoteWithAI(noteText) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "GEMINI_API_KEY is not set in environment variables." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
Bạn là một trợ lý AI chuyên phân tích ghi chú của môi giới bất động sản.
Nhiệm vụ của bạn là đọc đoạn ghi chú dưới đây và trích xuất thông tin khách hàng thành định dạng JSON CHÍNH XÁC.
Lưu ý: Chỉ trả về JSON, không kèm markdown hay text giải thích.

Các trường cần trích xuất:
- name: Tên khách hàng (nếu không rõ, để null)
- phone: Số điện thoại (nếu không rõ, để null)
- budget: Tài chính dự kiến (ví dụ: "3-4 tỷ", null nếu không có)
- demand: Nhu cầu cụ thể (ví dụ: "Mua ở 2PN", null nếu không có)
- area: Khu vực quan tâm (ví dụ: "Q7, Nhà Bè", null nếu không có)
- timeline: Thời gian dự kiến mua (ví dụ: "Tháng sau", null nếu không có)
- finance: Tình trạng tài chính (ví dụ: "Cần vay 50%", null nếu không có)
- heatLevel: Phân loại mức độ nét ("Rất Nét" | "Tiềm Năng" | "Quan Tâm" | "Tham Khảo" | "Chưa Rõ" - mặc định "Chưa Rõ")
- clarityScore: Điểm rõ ràng thông tin (Từ 0 đến 100, dựa trên mức độ đầy đủ của các thông tin trên)
- summary: Tóm tắt ngắn gọn ghi chú (1 câu)

Đoạn ghi chú:
"${noteText}"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text || "";
    // Clean markdown json formatting if any
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(text);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error("AI Parse Error:", error);
    return { error: "Failed to parse note with AI." };
  }
}

import { createClient } from "@/lib/supabase/server";

export async function createCustomerFromAI({ parsedData, rawNote }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Determine status & journey
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        name: parsedData.name || "Khách chưa rõ tên",
        phone: parsedData.phone || "Chưa có SĐT",
        status: "Đang chăm", // Vừa thêm vào thì active luôn để hiện lên queue
        budget: parsedData.budget,
        demand: parsedData.demand,
        area: parsedData.area,
        timeline: parsedData.timeline,
        finance: parsedData.finance,
        clarityScore: parsedData.clarityScore || 10,
        heatLevel: parsedData.heatLevel || "Chưa Rõ",
        journeyStage: "1. Phá băng và tư vấn ban đầu",
      },
    });

    // Create note
    if (rawNote) {
      await prisma.note.create({
        data: {
          customerId: customer.id,
          rawText: rawNote,
          parsed: true,
          parsedData: parsedData,
        },
      });
    }

    // Create interaction
    await prisma.interaction.create({
      data: {
        customerId: customer.id,
        type: "note",
        summary: parsedData.summary || "Thêm mới qua AI Data Entry",
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/customers");
      revalidatePath("/schedule");
    } catch (error) {
      console.error("Failed to revalidate paths after createCustomerFromAI:", error);
    }

    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("DB Create Error:", error);
    return { error: "Lỗi lưu dữ liệu vào Database" };
  }
}

export async function getAiReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const reports = await prisma.aiReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return reports.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString()
  }));
}

export async function generateWeeklyStrategy() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get active customers with all necessary fields for rich analysis
  const customers = await prisma.customer.findMany({
    where: { 
      userId: user.id,
      status: { notIn: ["Đã chốt", "Mất khách"] }
    },
    select: {
      name: true,
      phone: true,
      status: true,
      heatLevel: true,
      budget: true,
      demand: true,
      area: true,
      timeline: true,
      journeyStage: true,
      clarityScore: true,
      nextFollowUp: true,
      lastContactAt: true,
      createdAt: true,
    }
  });

  if (customers.length === 0) {
    return { error: "Bạn chưa có khách hàng nào đang mở để phân tích." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
Bạn là AI Coach - Trợ lý bán hàng thông minh chuyên phân tích dữ liệu CRM. Hãy rà soát toàn bộ dữ liệu CRM của tôi được cung cấp dưới đây và lập một Báo cáo Chiến lược cực kỳ MẠCH LẠC, GỌN GÀNG, ĐI THẲNG VÀO TRỌNG TÂM dưới dạng Dashboard Insight tương tự như thiết kế mẫu sau:

---

### Quy tắc tính toán số liệu dựa trên dữ liệu CRM:
1. **Giá trị ước lượng Deal:** Quy đổi từ trường tài chính "budget" của khách hàng để tính tổng giá trị dự kiến hoặc rủi ro (Dưới 2 tỷ = 1.5 tỷ; 2-3 tỷ = 2.5 tỷ; 3-5 tỷ = 4 tỷ; 5-10 tỷ = 7.5 tỷ; 10-20 tỷ = 15 tỷ; Trên 20 tỷ = 25 tỷ; Chưa xác định = 0 tỷ).
2. **Xác suất chốt lý thuyết:** Tự động tính toán xác suất chốt lý thuyết dựa trên độ nóng (heatLevel) và tiến độ hành trình (journeyStage). Ví dụ: Rất Nét + Dồn chốt/Chốt cọc = 85%-95%; Tiềm Năng + Hẹn gặp = 70%-80%; Quan Tâm + Tư vấn = 45%-60%...
3. **Rủi ro mất deal:** Đánh giá khách có nguy cơ mất cao nếu trạng thái là "Ngủ đông", "Chưa liên lạc được", hoặc có lịch hẹn quá hạn chăm sóc trên 3 ngày, hoặc hơn 14 ngày chưa tương tác chăm sóc lại.
4. **Trung thực tuyệt đối:** Chỉ kết luận dựa trên dữ liệu thực tế được cung cấp dưới đây. Tuyệt đối không bịa thông tin hay tên khách hàng. Nếu thiếu dữ liệu để rút ra kết luận, ghi rõ cụm từ: "Chưa đủ dữ liệu để kết luận".

---

Hãy xuất báo cáo bằng định dạng Markdown chính xác theo các tiêu đề và nội dung (Output) sau:

# 🧠 AI COACH - TRỢ LÝ BÁN HÀNG THÔNG MINH
*AI đã hoàn tất phân tích toàn bộ dữ liệu khách hàng cá nhân của bạn hôm nay.*

---

## 🔔 VIỆC CẦN LÀM NGAY
**Có [Số lượng] khách hàng cần được chăm sóc ngay lập tức!**
- **Tổng giá trị rủi ro:** [Tổng giá trị quy đổi của các khách hàng này] tỷ
- **Chi tiết báo động:** [Liệt kê tên 2-3 khách hàng quá hạn hẹn chăm sóc lâu nhất kèm thời gian trễ cụ thể. Ví dụ: **Nguyễn Văn A** (Trễ 3 ngày)].
- *Nếu không có khách hàng nào thỏa mãn, ghi:* **Chưa đủ dữ liệu để kết luận**

---

## 🎯 CƠ HỘI TIỀM NĂNG
**Có [Số lượng] khách hàng có xác suất chốt giao dịch cao (> 70%)!**
- **Tổng giá trị dự kiến:** [Tổng giá trị quy đổi của các khách hàng này] tỷ
- **Top cơ hội vàng:** [Liệt kê danh sách các khách hàng tiềm năng nhất kèm xác suất chốt lý thuyết tự tính, giá trị deal ước lượng, dự án tags và nguồn khách nếu có. Ví dụ: 1. **Nguyễn Văn A** (Xác suất chốt: **92%** - Giá trị: **4.2 tỷ** - Dự án: **The Zen Park** - Nguồn: **Website**)].
- *Nếu không có khách hàng nào thỏa mãn, ghi:* **Chưa đủ dữ liệu để kết luận**

---

## ⚠️ RỦI RO MẤT DEAL
**Có [Số lượng] khách hàng đang nằm trong vùng nguy hiểm có nguy cơ mất!**
- **Tổng giá trị rủi ro bị đe dọa:** [Tổng giá trị quy đổi của các khách hàng này] tỷ
- **Danh sách báo động đỏ:** [Liệt kê tên các khách hàng có nguy cơ mất deal cao do đã quá lâu chưa liên lạc hoặc đang ngủ đông. Ví dụ: **Trần Thị B** (Ngủ đông, **3.6 tỷ**)].
- *Nếu không có khách hàng nào thỏa mãn, ghi:* **Chưa đủ dữ liệu để kết luận**

---

## 🧱 AI COACHING - ĐIỂM NGHẼN PIPELINE
- **Điểm nghẽn lớn nhất trong phễu:** [Ví dụ: **Hẹn gặp ➜ Đàm phán** hoặc **Phá băng ➜ Tư vấn chuyên sâu**]
- **Phân tích chi tiết:** [Phân tích ngắn gọn 1-2 câu về sự dồn ứ ở bước này trong hành trình (journeyStage). Ví dụ: Lượng khách dồn ứ tại bước "1. Phá băng" đang chiếm 60% tổng số khách, tỷ lệ chuyển đổi lên bước "2. Tư vấn" đang rất thấp].
- *Nếu không có khách hàng nào thỏa mãn, ghi:* **Chưa đủ dữ liệu để kết luận**

---

## 🚀 GỢI Ý HÀNH ĐỘNG HÔM NAY
*AI đã lên kế hoạch chi tiết 3 việc quan trọng nhất bạn cần thực hiện ngay:*
1. [Hành động ưu tiên số 1 - ghi rõ tên khách hàng và hành động cụ thể dựa trên dữ liệu. Ví dụ: Liên hệ **Nguyễn Văn A** để chốt lịch xem căn hộ **The Zen Park** vì xác suất chốt đã đạt **92%**].
2. [Hành động ưu tiên số 2]
3. [Hành động ưu tiên số 3]
- *Nếu không đủ thông tin để đề xuất hành động cụ thể, ghi:* **Chưa đủ dữ liệu để kết luận**

---

## 🔍 CẢNH BÁO CHẤT LƯỢNG DỮ LIỆU
- [Chỉ ra các khách hàng cụ thể đang bị thiếu thông tin quan trọng như SĐT, tài chính budget, hoặc nhu cầu cụ thể khiến điểm clarityScore bị thấp, hoặc ghi "Không có cảnh báo - Dữ liệu sạch sẽ hoàn hảo!"].

---

Dữ liệu CRM thực tế của tôi:
${JSON.stringify(customers, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const content = response.text || "Không thể tạo báo cáo.";

    const report = await prisma.aiReport.create({
      data: {
        userId: user.id,
        content: content,
      }
    });

    return { 
      success: true, 
      report: {
        ...report,
        createdAt: report.createdAt.toISOString()
      } 
    };
  } catch (error) {
    console.error("AI Strategy Error:", error);
    return { error: "Lỗi kết nối AI Engine." };
  }
}

