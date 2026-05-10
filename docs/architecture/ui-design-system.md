# UI Design System
**Dự án:** SalesPush CRM MVP

## Triết lý thiết kế
- **Mobile-first**: Tối ưu cho thao tác 1 tay (thumb-zone).
- **Glassmorphism nhẹ**: Nền bán trong suốt + blur, tạo chiều sâu.
- **10-Second Rule**: Mọi thao tác chăm sóc khách hàng phải hoàn thành trong 10 giây.

## Color Palette
```css
@theme {
  --color-primary-50: #eff6ff;   /* Background nhẹ */
  --color-primary-100: #dbeafe;  /* Hover state */
  --color-primary-400: #60a5fa;  /* Secondary */
  --color-primary-500: #3b82f6;  /* Primary */
  --color-primary-600: #2563eb;  /* Primary dark */
  --color-primary-800: #1e40af;  /* Deep accent */
}
```
- **Background**: `#f0f5ff` (very light blue)
- **Card**: `rgba(255, 255, 255, 0.82)` + `backdrop-blur(20px)`
- **Text Primary**: `#1e293b` (slate-800)
- **Text Secondary**: `#64748b` (slate-500)

## Heat Level Badges
| Level | Emoji | BG | Text |
|---|---|---|---|
| Hot (Rất cao) | 🔥 | `bg-red-50` | `text-red-600` |
| Warm (Cao) | 🌡️ | `bg-amber-50` | `text-amber-600` |
| Cold (Trung bình) | ❄️ | `bg-slate-100` | `text-slate-500` |

## Status Dots
| Status | Color |
|---|---|
| New | `bg-blue-500` |
| Active | `bg-emerald-500` |
| Waiting | `bg-amber-500` |
| Dormant | `bg-slate-400` |
| Closed | `bg-teal-500` |
| Lost | `bg-red-500` |

## Components

### 1. FocusCard (`src/components/FocusCard.js`)
- Thẻ lớn, `rounded-3xl`, glass effect
- Avatar gradient, Heat badge, Phone tappable
- 💡 Lý do chăm + 📋 Bước tiếp theo
- Bottom row: Trạng thái | Hành trình | Thời gian
- CTA button gradient primary
- Swipe left → snooze (touchmove)

### 2. RadarCard (`src/components/RadarCard.js`)
- Thẻ nhỏ, `rounded-2xl`, glass effect
- Avatar, Name, Phone (truncated)
- Heat badge + Time countdown
- Click → mở CompletionSheet

### 3. CompletionSheet (`src/components/CompletionSheet.js`)
- Bottom Sheet slide-up animation
- Textarea + Mic button (placeholder)
- Quick Date Chips (Chiều nay, Sáng mai, 3 ngày, Tuần sau)
- Swipe-to-complete slider (drag thumb → 80% = complete)

### 4. BottomNav (`src/components/BottomNav.js`)
- 4 tabs: Hôm nay / Khách hàng / Lịch hẹn / Cá nhân
- Active dot indicator
- Fixed bottom, backdrop-blur

### 5. InboxZero (`src/components/InboxZero.js`)
- 🎉 Celebration animation
- Hiện khi queue rỗng

## Animations
| Name | Keyframes | Duration |
|---|---|---|
| `slideUp` | Y 100% → 0 | 0.4s |
| `fadeInUp` | Y 20px, 0 opacity → 0, 1 | 0.5s |
| `fadeOutLeft` | X 0 → -120% | 0.35s |
| `fadeInRight` | X 40px → 0 | 0.4s |
| `celebration` | Scale 0.8 → 1.05 → 1 | 0.6s |
| `shimmer` | X -100% → 100% (swipe track) | 2.5s infinite |
