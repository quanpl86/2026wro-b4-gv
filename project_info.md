# 🌍 PROJECT INFO: THE HERITAGE KEEPER (WRO 2026)

## 📖 1. Giới thiệu dự án
**The Heritage Keeper** (Người Giữ Lửa Di Sản) là một hệ thống Phygital (Vật lý kết hợp Kỹ thuật số) được thiết kế cho cuộc thi WRO 2026. Dự án sử dụng Robot thông minh làm hướng dẫn viên để giới thiệu và bảo tồn các giá trị di sản văn hóa thế giới.

## 🚀 2. Điểm đặc biệt (Innovation)
- **AI Đa phương thức:** Kết hợp nhận diện hình ảnh (Observer) và giọng nói (Listener) để tương tác tự nhiên với con người.
- **Trình diễn Real-time:** Web App đồng bộ hóa tức thì với vị trí và hành động của Robot.
- **Kiến trúc Cloud-Native:** Sử dụng Supabase và MQTT để điều khiển và quản lý dữ liệu hiệu suất cao.

## 📈 3. Trạng thái Triển khai (Live Status)
- **Phase 1 (Foundation):** Đã hoàn thành (Cấu trúc monorepo, 9 Agent Personas).
- **Phase 2 (Connectivity):** Đã hoàn thành (Kết nối Supabase, GitHub Sync).
- **Phase 3 (Intelligence):** Đã hoàn thành (Điều hướng cơ bản, Motor Tune).
- **Phase 4 (QR Vision):** Đã hoàn thành (Migrated ArUco -> QR engine, jsQR integration).
- **Phase 5 (The Storyteller):** Đang triển khai (Hoàn thành Judge Portal, Live Map tracking, Dynamic Hub IP).
- **Phase 6 (Independence):** Đã lên kế hoạch (Mini-games, RPi Hub).

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
