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
- heatLevel: Phân loại mức độ nét ("Hot" | "Warm" | "Cold" - mặc định "Cold")
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

export async function createCustomerFromAI({ parsedData, rawNote }) {
  try {
    // Determine status & journey
    const customer = await prisma.customer.create({
      data: {
        name: parsedData.name || "Khách chưa rõ tên",
        phone: parsedData.phone || "Chưa có SĐT",
        status: "Active", // Vừa thêm vào thì active luôn để hiện lên queue
        budget: parsedData.budget,
        demand: parsedData.demand,
        area: parsedData.area,
        timeline: parsedData.timeline,
        finance: parsedData.finance,
        clarityScore: parsedData.clarityScore || 10,
        heatLevel: parsedData.heatLevel || "Cold",
        journeyStage: "Lead",
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
