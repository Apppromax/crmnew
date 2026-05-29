import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function enrichStatus(customer) {
  if (!customer) return customer;
  if (customer.status !== "Đang chăm" && customer.status !== "Đang chờ") return customer;
  if (!customer.lastContactAt && !customer.createdAt) return customer;

  const now = new Date();
  const lastContact = customer.lastContactAt
    ? new Date(customer.lastContactAt)
    : new Date(customer.createdAt);
  const diffMinutes = (now - lastContact) / 60000;

  if (diffMinutes <= 30) {
    customer.status = "Đang chăm";
  } else if (customer.nextFollowUp) {
    customer.status = "Đang chờ";
  }

  return customer;
}

export function calculateClarityScore({ budget, demand, area, timeline, heatLevel }) {
  let score = 0;
  if (budget && budget !== "" && budget !== "Chưa xác định") score += 20;
  if (demand && demand !== "" && demand !== "Khác") score += 20;
  if (area && area !== "" && area !== "Khác") score += 20;
  if (timeline && timeline !== "" && timeline !== "Tham khảo" && timeline !== "Tham khảo (Chưa rõ)") score += 20;
  
  if (heatLevel === "Rất Nét") score += 20;
  else if (heatLevel === "Tiềm Năng") score += 15;
  else if (heatLevel === "Quan Tâm") score += 10;
  else if (heatLevel === "Tham Khảo") score += 5;
  
  return score;
}
