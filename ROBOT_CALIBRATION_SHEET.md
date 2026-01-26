# 📏 ROBOT CALIBRATION & EMOTION SHEET
> **Mục tiêu:** Ghi lại các thông số vật lý của Robot để cấu hình vào `mobile_node.py`.

---

## 1. Cấu Hình Giới Hạn Tay (Arm Limits)
*Hướng dẫn: Dùng tay xoay nhẹ motor đến vị trí mong muốn, đọc thông số độ trên màn hình EV3 (Port View) hoặc đoán ước lượng.*

| Thông Số | Biến Code tương ứng | Giá trị đo được (Degree) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Tay Trái - Vị trí nghỉ** | `ARM_LEFT_LIMIT_DOWN` | `.......` | Thường là 0 (ép sát thân) |
| **Tay Trái - Giơ cao nhất** | `ARM_LEFT_LIMIT_UP` | `.......` | Ví dụ: 90 (ngang vai), 180 (thẳng lên trời) |
| **Tay Phải - Vị trí nghỉ** | `ARM_RIGHT_LIMIT_DOWN` | `.......` | |
| **Tay Phải - Giơ cao nhất** | `ARM_RIGHT_LIMIT_UP` | `.......` | |

---

## 2. Kịch Bản Diễn Hoạt (Animation Scripts)
*Hướng dẫn: Xác định biên độ dao động cho các hành động cụ thể.*

### 👋 Hành động: HELLO (Vẫy tay)
- **Mô tả:** 2 tay đưa lên xuống nhịp nhàng.
- **Biên độ dao động:** Từ `.......` độ đến `.......` độ.
- **Tốc độ (Speed):** `.......` (Khuyên dùng: 30-50).
- **Số lần vẫy:** `.......` lần.

### 👉 Hành động: POINT_LEFT (Chỉ trạm bên trái)
- **Mô tả:** Tay trái giơ thẳng ra hướng trạm, giữ nguyên 1 lúc.
- **Góc chỉ tay:** `.......` độ (Thường là 90 độ - ngang vai).
- **Thời gian giữ (Hold Time):** `.......` giây.

### 🎉 Hành động: HAPPY (Ăn mừng)
- **Mô tả:** 2 tay vung mạnh lên trời, có thể xoay xoay robot.
- **Góc vung tay:** `.......` độ (Max Up).
- **Âm thanh:** [ ] Có nhạc / [ ] Chỉ Beep.

---

## 3. Cấu Hình Vision (Camera)
- **Chiều cao Camera (từ mặt sàn):** `.......` cm.
- **Góc nghiêng Camera:** `.......` độ (Thường cúi xuống 15-20 độ để nhìn line và QR dưới sàn).

---

## 📝 Nhật Ký Test
*Ghi lại các vấn đề gặp phải khi chạy thử Animation:*
- [ ] Tay trái bị kẹt khi hạ xuống?
- [ ] Tốc độ vẫy quá nhanh nhìn không thân thiện?
- [ ] Robot bị rung khi vung tay mạnh?
