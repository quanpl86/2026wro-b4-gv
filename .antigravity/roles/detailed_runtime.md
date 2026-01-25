# Chi Tiết Công Việc: Nhóm Runtime Agents (Operating Group)

Nhóm này là các module phần mềm chạy thực tế trên Laptop/Robot để vận hành Phygital System.

---

## 4. AG-Run-04: The Observer (Thị giác)
**Vai trò:** Cửa sổ nhìn ra thế giới của Robot.

### Công việc cụ thể:
- **Frame Processing:** Sử dụng OpenCV để xử lý luồng video từ Camera Laptop.
- **Object Recognition:** Tích hợp Model nhận diện (TensorFlow Lite hoặc Teachable Machine) để phân biệt các mô hình di sản (Trống đồng, Cột cờ...).
- **Data Signaling:** Gửi kết quả nhận diện kèm mức độ tin cậy (Confidence) về Commander thông qua MQTT hoặc Local API.

---

## 5. AG-Run-05: The Listener (Thính giác)
**Vai trò:** Hệ thống tiếp nhận phản hồi từ con người.

### Công việc cụ thể:
- **Vosk Integration:** Chạy engine STT (Speech-to-Text) Offline để đảm bảo hoạt động không cần Internet.
- **Natural Language Parsing:** Phân tích từ khóa tiếng Việt để trích xuất Intent (Ví dụ: "Kể cho tôi" -> `intent: detail_info`).
- **Wake-word Detection:** Lắng nghe từ khóa kích hoạt "Robot ơi" để bắt đầu quá trình tương tác.

---

## 6. AG-Run-06: The Commander (Bộ não Logic)
**Vai trò:** Chỉ huy trưởng và Điều phối viên.

### Công việc cụ thể:
- **State Machine:** Quản lý trạng thái hiện tại của hệ thống (Đang đi, Đang nói, Đang chờ).
- **Decision Logic:** Quyết định hành động dựa trên Input:
	- Nếu Observer thấy vạch dừng -> Ra lệnh Operator dừng xe.
	- Nếu Listener nhận yêu cầu kể chuyện -> Ra lệnh Storyteller hiện Video.
- **Global Sync:** Cập nhật mọi thay đổi vào bảng `system_status` trên Supabase.

---

## 7. AG-Run-07: The Operator (Phần cứng)
**Vai trò:** Cánh tay thực thi của Robot.

### Công việc cụ thể:
- **MQTT Driver:** Lắng nghe Topic `antigravyti/command/#` để nhận lệnh điều khiển.
- **EV3 Control:** Truyền lệnh xuống Robot EV3 thông qua Bluetooth/WiFi để điều khiển motor bánh xe và tay/đầu.
- **ESP32/LED Control:** Điều khiển màu sắc LED NeoPixel tương ứng với cảm xúc và nội dung câu chuyện (Đỏ: hào hùng, Xanh: yên bình).

---

## 8. AG-Run-08: The Storyteller (Giao diện Web)
**Vai trò:** Người dẫn chuyện kỹ thuật số.

### Công việc cụ thể:
- **Dynamic Content:** Hiển thị video, hình ảnh và văn bản giới thiệu di sản dựa trên `current_station`.
- **Real-time Interaction:** Lắng nghe Supabase Realtime để tự lật trang Web khi Robot đến trạm mới.
- **Mini-games & Quiz:** Vận hành các trò chơi nhỏ để giám khảo tương tác trực tiếp trên Tablet, gửi kết quả về `quiz_data`.

---

## 9. AG-Run-09: The QA & Safety (Giám sát viên - Đề xuất thêm)
**Vai trò:** Bảo trì và Đảm bảo an toàn.

### Công việc cụ thể:
- **Health Check:** Giám sát dung lượng pin EV3 và trạng thái kết nối MQTT.
- **Emergency Stop:** Cung cấp nút dừng khẩn cấp trên giao diện Web và tự động ngắt motor nếu mất kết nối AI Brain quá 3 giây.
