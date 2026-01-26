# 🌍 PROJECT INFO: THE HERITAGE KEEPER (WRO 2026)

## 📖 1. Giới thiệu dự án
**The Heritage Keeper** (Người Giữ Lửa Di Sản) là một hệ thống Phygital (Vật lý kết hợp Kỹ thuật số) được thiết kế cho cuộc thi WRO 2026. Dự án sử dụng Robot thông minh làm hướng dẫn viên để giới thiệu và bảo tồn các giá trị di sản văn hóa thế giới.

## 🚀 2. Điểm đặc biệt (Innovation)
- **AI Đa phương thức:** Kết hợp Gemini AI (LLM) và Web Speech API (TTS) để tạo ra các cuộc hội thoại di sản sống động và thông minh.
- **Trình diễn Real-time:** Web App đồng bộ hóa tức thì với vị trí và hành động của Robot qua WebSocket & MQTT.
- **Kiến trúc Hub-and-Spoke Hybrid:** Laptop đóng vai trò AI Brain Hub, kết nối Mobile Robot qua WiFi và Static Stations qua Bluetooth PAN (IP over BT).
- **Hệ thống TTS Độ trễ thấp:** Sử dụng trình duyệt để phát âm thanh ngay lập tức mà không cần phụ thuộc vào mạng Cloud (Zero-Latency Voice).

### 3. Hardware Architecture 🤖
- **Mobile Robot (Social Guide):** EV3 running **ev3dev**.
    - **Movement:** Tank Drive (Port B+C).
    - **Interaction:** Dual Arms (Port A+D) for gestures (Wave, Point, Cheer).
    - **Vision:** Fixed Front-Facing Smartphone (Web-based processing).
    - **Sensors:** 2x Color, 1x Ultrasonic, 1x Gyro.
- **Station Controller:** 2x EV3 controlling 4 automation sites (Gates, Flags, Decor).
- **Lighting:** ESP32 for ambient RGB effects via MQTT.

## 📈 4. Trạng thái Triển khai (Live Status)
- **Phase 1 (Foundation):** Đã hoàn thành (Cấu trúc monorepo, 9 Agent Personas).
- **Phase 2 (Connectivity):** Đã hoàn thành (Kết nối Supabase, GitHub Sync).
- **Phase 3 (Intelligence):** Đã hoàn thành (Điều hướng cơ bản, Motor Tune).
- **Phase 4 (QR Vision):** Đã hoàn thành (Migrated ArUco -> QR engine, jsQR integration).
- **Phase 5 (The Storyteller):** Đã hoàn thành (Judge Portal, Live Map tracking, Mini-games, Digital Badges).
- **Phase 6 (Immersive Upgrade):** Đã hoàn thành (Gemini AI Smart Guide, Visual CMS, Advanced Quiz Builder, Adaptive Map Editor, Cloud Storage Integration).

---

## 🔄 4. Quy trình Đồng bộ hóa AI (AI Sync Protocol)
> **QUY TẮC CỨNG:** Mọi AI Agent khi thực hiện một tính năng mới hoặc thay đổi quan trọng trong logic dự án PHẢI cập nhật thông tin đó vào file `PROJECT_INFO.md` này.

### Cách thức đồng bộ:
1. **Kiểm tra:** Trước khi bắt đầu task, Agent đọc `PROJECT_INFO.md` và thư mục `.antigravity` để nắm bắt tình hình.
2. **Thực thi:** Triển khai code/tính năng.
3. **Cập nhật:** Sau khi xác nhận tính năng đã chạy (verified), Agent phải cập nhật phần **3. Trạng thái Triển khai** và mục **5. Tính năng hiện hữu**.

---

## ✅ 5. Tính năng hiện hữu (Latest Features)
- [x] **QR Site Recognition:** Nhận diện các di sản bằng QR code độ chính xác cao.
- [x] **Interactive Judge Portal:** Dashboard iPad-optimized với mã PIN bảo mật (2026).
- [x] **Live Journey Mapping:** Trình diễn lộ trình Robot thời gian thực dưới dạng bản đồ số hóa.
- [x] **Zero-Config Networking:** Tự động khám phá IP của Hub trên mọi mạng Wi-Fi.
- [x] **Cấu hình Robot linh hoạt:** Thiết lập cổng Motor/Sensor và Tốc độ ngay trên trình duyệt.
- [x] **Keyboard Mapping:** Điều khiển thủ công bằng WASD/Mũi tên với layout tùy biến.
- [x] **Hệ sinh thái AI Roles:** 9 Agent chuyên biệt giúp phát triển dự án quy mô lớn.
- [x] **Gemini 2.5/3 Heritage Guide:** Tích hợp AI thế hệ mới để thuyết minh di sản và nhận diện ý định điều khiển (Intent Control).
- [x] **Hybrid AI Chat (Thoại & Chữ):** Cho phép tương tác song song bằng giọng nói và văn bản ngay trên Dashboard.
- [x] **Heritage Simulator:** Môi trường giả lập 100% Phygital giúp kiểm tra kịch bản di sản mà không cần robot vật lý.
- [x] **Adaptive Map Editor:** Công cụ quản trị cho phép kéo thả, căn chỉnh vị trí di sản và robot trực tiếp trên Web.
- [x] **Supabase Storage Integration:** Hỗ trợ tải ảnh sa bàn thực tế lên Cloud để làm hình nền bản đồ.
- [x] **Responsive Map Logic:** Thuật toán tự động cân tỷ lệ, đảm bảo Pins luôn đúng vị trí trên mọi loại màn hình.
- [x] **Visual CMS:** Quản lý nội dung di sản và câu hỏi trắc nghiệm trực quan trực tiếp trên bản đồ.
- [x] **Advanced Quiz System:** Hỗ trợ đa dạng loại câu hỏi (MCQ, Matching, Sequencing), giải thích đáp án và tính điểm linh hoạt.
- [x] **Auto-Persistence:** Tự động lưu trữ mọi thay đổi cấu hình map và quiz lên Supabase thời gian thực.
