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
- **Phase 3 (Intelligence):** Đang triển khai (Đã hoàn thành điều hướng Robot cơ bản, đang chuẩn bị cho Vision & Voice).

---

## 🔄 4. Quy trình Đồng bộ hóa AI (AI Sync Protocol)
> **QUY TẮC CỨNG:** Mọi AI Agent khi thực hiện một tính năng mới hoặc thay đổi quan trọng trong logic dự án PHẢI cập nhật thông tin đó vào file `PROJECT_INFO.md` này.

### Cách thức đồng bộ:
1. **Kiểm tra:** Trước khi bắt đầu task, Agent đọc `PROJECT_INFO.md` để nắm bắt tình hình thực tế.
2. **Thực thi:** Triển khai code/tính năng.
3. **Cập nhật:** Sau khi xác nhận tính năng đã chạy (verified), Agent phải cập nhật phần **3. Trạng thái Triển khai** và thêm thông tin mới vào mục **5. Tính năng hiện hữu**.

---

## ✅ 5. Tính năng hiện hữu (Latest Features)
- [x] Hệ thống Monorepo ổn định & GitHub Auto-sync.
- [x] Giao diện điều khiển **EV3 Controller** (Dark mode, glassmorphism).
- [x] **Keyboard Mapping:** Điều khiển robot bằng WASD, Phím mũi tên hoặc phím gán tự chọn.
- [x] **Hiệu suất cao:** Scale tốc độ robot lên 600mm/s với phản hồi thời gian thực (<100ms).
- [x] **Chẩn đoán thông minh:** Tự động phát hiện xung đột cổng motor trên UI và màn hình EV3.
- [x] **Quản lý Profile:** Tự động khởi tạo cấu hình robot trong Supabase.
- [x] Persona & Role map chi tiết cho 9 AI Agent.
