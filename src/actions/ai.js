"use server";

import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

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
        journeyStage: "1. Phá băng và làm rõ nhu cầu",
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
Bạn là Cố vấn Chiến lược Bán hàng (AI Engine) chuyên nghiệp.
Phân tích danh sách khách hàng dưới đây và đưa ra:
1. Đánh giá tình hình hiện tại (Tổng quan số lượng, chất lượng tệp khách hàng).
2. Phân tích khả thi của các giao dịch (Tập trung vào khách Hot và khách có lịch hẹn).
3. Định hướng & Hành động cụ thể trong 1 tuần tới để đạt mục tiêu chốt sale.

Danh sách khách hàng:
${JSON.stringify(customers, null, 2)}

Hãy viết báo cáo bằng Markdown. Định dạng thật rõ ràng, chuyên nghiệp, sử dụng bullet points, in đậm những ý quan trọng. Không cần lặp lại danh sách khách, hãy tập trung vào insights và action.
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

