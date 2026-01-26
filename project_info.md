# 🌍 PROJECT INFO: THE HERITAGE KEEPER (WRO 2026)

## 📖 1. Giới thiệu dự án
**The Heritage Keeper** (Người Giữ Lửa Di Sản) là một hệ thống Phygital (Vật lý kết hợp Kỹ thuật số) được thiết kế cho cuộc thi WRO 2026. Dự án sử dụng Robot thông minh làm hướng dẫn viên để giới thiệu và bảo tồn các giá trị di sản văn hóa thế giới.

## 🚀 2. Điểm đặc biệt (Innovation)
- **AI Đa phương thức:** Kết hợp Gemini AI (LLM) và Web Speech API (TTS) để tạo ra các cuộc hội thoại di sản sống động và thông minh.
- **Trình diễn Real-time:** Web App đồng bộ hóa tức thì với vị trí và hành động của Robot qua WebSocket & MQTT.
- **Kiến trúc Hub-and-Spoke:** Laptop đóng vai trò AI Brain Hub, kết nối không dây giữa Robot EV3, Smartphone (Vision) và Tablet (Dashboard).
- **Hệ thống TTS Độ trễ thấp:** Sử dụng trình duyệt để phát âm thanh ngay lập tức mà không cần phụ thuộc vào mạng Cloud (Zero-Latency Voice).

## 📈 3. Trạng thái Triển khai (Live Status)
- **Phase 1 (Foundation):** Đã hoàn thành (Cấu trúc monorepo, 9 Agent Personas).
- **Phase 2 (Connectivity):** Đã hoàn thành (Kết nối Supabase, GitHub Sync).
- **Phase 3 (Intelligence):** Đã hoàn thành (Điều hướng cơ bản, Motor Tune).
- **Phase 4 (QR Vision):** Đã hoàn thành (Migrated ArUco -> QR engine, jsQR integration).
- **Phase 5 (The Storyteller):** Đang triển khai (Hoàn thành Judge Portal, Live Map tracking, Dynamic Hub IP).
- **Phase 6 (Independence):** Đang triển khai (Hoàn thành Gemini AI Smart Guide, Hybrid Chat, Simulator, Phygital Arena, Game Mastery và Interactive Heritage FlipBook).

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
