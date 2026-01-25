# 📖 HƯỚNG DẪN SỬ DỤNG: THE HERITAGE KEEPER

Tài liệu này hướng dẫn cách vận hành toàn bộ hệ thống Antigravyti.

---

## 🚀 1. Khởi động nhanh (Quick Start)
Để khởi động toàn bộ hệ thống (Web + AI Brain), hãy mở terminal tại thư mục gốc và chạy:
```bash
npm run start
```
- **Web App:** Truy cập `http://localhost:3000`
- **AI Brain (Commander):** Kết nối với Supabase để nhận lệnh:
  ```bash
  cd apps/ai-brain && ./venv/bin/python command_listener.py
  ```
- **Vision/Voice:** Tự động lắng nghe camera và microphone khi chạy `main.py`.

---

## 🖥️ 2. Các chức năng chính (Main Functions)

### A. Giao diện Web (Storyteller)
- **Dashboard:** Theo dõi trạng thái robot và sa bàn thời gian thực.
- **Trình chiếu Di sản:** Tự động hiển thị nội dung video/hình ảnh khi robot đến trạm.
- **Interactive Quiz:** Tham gia trả lời câu hỏi để tích điểm ngay trên Tablet.
- **EV3 Test UI:** Truy cập `/dashboard/test-control` để kiểm tra khả năng di chuyển của Robot.

### B. Bộ não AI (AI Brain)
- **Observer (Nhìn):** Để camera Laptop hướng về phía sa bàn. Robot sẽ nhận diện các mô hình đặt trên bàn.
- **Listener (Nghe):** Nói "Robot ơi" để kích hoạt, sau đó đưa ra khẩu lệnh (ví dụ: "Kể chuyện trạm này đi").

### C. Điều khiển Phần cứng (Operator)
- **Tự động:** Robot dò line và dừng tại các trạm đã định nghĩa.
- **Thủ công:** Có thể điều khiển hướng di chuyển của robot qua bảng điều khiển trên Web Dashboard.

---

## 🛠️ 3. Cấu hình & Bảo trì
- **Môi trường:** Đảm bảo đã thiết lập file `.env` với thông tin Supabase chính xác.
- **Hardware:** Kiểm tra kết nối MQTT Broker giữa Laptop và EV3/ESP32.

---

## 🔄 4. Quy trình Cập nhật cho AI (AI Update Protocol)
> **GHI CHÚ CHO AI:** Khi xây dựng một tính năng mới hoặc thay đổi cách thức hoạt động của một chức năng sẵn có, AI Agent BẮT BUỘC phải cập nhật hướng dẫn tương ứng vào file này.

### Các bước thực hiện:
1. Phân tích chức năng mới/hiệu chỉnh.
2. Cập nhật mục **2. Các chức năng chính** với mô tả rõ ràng.
3. Nếu có lệnh mới hoặc cấu hình mới, cập nhật mục **1. Khởi động nhanh** hoặc **3. Cấu hình**.
