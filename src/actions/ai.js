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

  // Get active customers
  const customers = await prisma.customer.findMany({
    where: { 
      userId: user.id,
      status: { notIn: ["Đã chốt", "Mất khách"] }
    },
    select: {
      name: true,
      budget: true,
      demand: true,
      heatLevel: true,
      journeyStage: true,
      clarityScore: true,
      nextFollowUp: true,
    }
  });

  if (customers.length === 0) {
    return { error: "Bạn chưa có khách hàng nào đang mở để phân tích." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
Bạn là Cố vấn Chiến lược Bán hàng (AI Engine) chuyên nghiệp và nhạy bén.
Hãy phân tích toàn bộ danh sách khách hàng dưới đây để lập một Báo cáo Chiến lược cực kỳ MẠCH LẠC, GỌN GÀNG, ĐI THẲNG VÀO TRỌNG TÂM dựa trên 4 mục tiêu sau:

1. 🎯 PHÁT HIỆN KHÁCH HÀNG TIỀM NĂNG NHẤT:
   - Hãy chỉ đích danh tên và phân tích các khách hàng có tiềm năng giao dịch cao nhất dựa trên mức độ nét (heatLevel), tài chính (budget), và nhu cầu cụ thể (demand).

2. ⚠️ CẢNH BÁO KHÁCH ĐANG BỊ BỎ SÓT:
   - Liệt kê ngay các khách hàng có lịch hẹn đã quá hạn chăm sóc (overdue) hoặc đã lâu chưa được tương tác chăm sóc lại.

3. 📊 ĐIỂM NGHẼN TRONG PHỄU BÁN HÀNG:
   - Chỉ ra điểm nghẽn hiện tại (ví dụ: lượng khách đang dồn ứ quá nhiều ở bước "Phá băng" mà chưa chuyển qua "Tư vấn chuyên sâu", hoặc "Dồn chốt" bị tắc nghẽn) và đưa ra gợi ý tháo gỡ.

4. 🚀 ĐỀ XUẤT HÀNH ĐỘNG ƯU TIÊN HÔM NAY:
   - Liệt kê 3-5 hành động cụ thể, ưu tiên cần làm ngay hôm nay cho các khách hàng mục tiêu để tạo bước tiến trong phễu bán hàng.

Nguyên tắc báo cáo quan trọng:
- Tuyệt đối làm việc dựa trên dữ liệu phân tích thực tế từ danh sách khách hàng, không nhận định cảm tính.
- Báo cáo phải cực kỳ mạch lạc, gọn gàng, có tiêu đề rõ ràng, sử dụng bullet points ngắn gọn và in đậm các từ khóa/tên khách hàng quan trọng.
- KHÔNG lặp lại danh sách khách hàng dài dòng, chỉ tập trung vào phân tích chất lượng (insights) và hành động (actions) thực tế.

Danh sách khách hàng của tôi:
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

