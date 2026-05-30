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
Bạn là AI phân tích CRM chuyên nghiệp và nhạy bén. Hãy rà soát toàn bộ dữ liệu CRM của người dùng dưới đây và tạo báo cáo ngắn gọn, sạch, có thể hành động ngay.

Nhiệm vụ của bạn:
1. Tìm khách hàng/deal tiềm năng nhất.
2. Cảnh báo khách hàng đang bị bỏ sót.
3. Phát hiện điểm nghẽn trong phễu bán hàng.
4. Đề xuất các hành động ưu tiên cần làm hôm nay.

Quy tắc phân tích nghiêm ngặt:
- Chỉ kết luận dựa trên dữ liệu thực tế có sẵn được cung cấp dưới đây. Tuyệt đối không tự bịa hay suy diễn thông tin nằm ngoài dữ liệu.
- Nếu thiếu dữ liệu để rút ra kết luận ở bất kỳ mục nào, hãy ghi rõ cụm từ: "Chưa đủ dữ liệu để kết luận".
- Mỗi phát hiện, nhận định hoặc insight đưa ra phải đi kèm lý do và bằng chứng dữ liệu cụ thể rõ ràng (ví dụ: căn cứ theo mức độ nét heatLevel, ngày liên hệ cuối lastContactAt, điểm clarityScore, hoặc lịch hẹn quá hạn nextFollowUp).
- Ưu tiên đề xuất các hành động thiết thực giúp trực tiếp tăng doanh thu hoặc giảm thiểu nguy cơ mất khách hàng.
- Trả kết quả cực kỳ ngắn gọn, rõ ràng, mạch lạc và chuyên nghiệp.

Hãy viết báo cáo bằng Markdown và chia chính xác theo các tiêu đề (Output) sau:

## 📊 Tổng quan nhanh
[Tóm tắt siêu ngắn gọn về sức khỏe tệp khách hàng của bạn hôm nay]

## 🎯 Top khách hàng tiềm năng
[Danh sách khách hàng tiềm năng nhất. Phải ghi rõ tên khách và bằng chứng dữ liệu: ví dụ mức độ nét Rất Nét, tài chính tốt, nhu cầu rõ ràng hoặc điểm clarityScore cao...]

## ⚠️ Khách hàng có nguy cơ bị bỏ sót
[Cảnh báo các khách hàng quá hạn chăm sóc (overdue) hoặc không có lịch hẹn tiếp theo và đã quá lâu chưa tương tác dựa trên lastContactAt/createdAt...]

## 📊 Điểm nghẽn pipeline
[Phân tích sự phân bổ khách hàng trong các bước của phễu bán hàng (journeyStage) và chỉ ra nơi đang bị dồn ứ/tắc nghẽn...]

## 🚀 Việc nên làm hôm nay
[Đề xuất các hành động ưu tiên, cụ thể và thực tế cần làm ngay hôm nay để chốt sale hoặc cứu khách sắp mất]

## 🔍 Cảnh báo chất lượng dữ liệu (nếu có)
[Chỉ ra các khách hàng bị thiếu thông tin quan trọng như SĐT, tài chính, nhu cầu... làm giảm chất lượng chăm sóc, hoặc ghi "Không có cảnh báo" nếu dữ liệu đã sạch hoàn toàn]

Dữ liệu CRM của tôi:
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

