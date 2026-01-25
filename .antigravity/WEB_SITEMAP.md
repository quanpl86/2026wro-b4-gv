# 🗺️ Next.js Web App: Sitemap

Cấu trúc phân cấp các trang trong ứng dụng Web dành cho Giám khảo và Khách tham quan.

## 1. Public / Guest View
- `/` - **Home / Hero Page**: Giới thiệu dự án "The Heritage Keeper".
- `/gallery` - **Di sản số**: Xem lại các hình ảnh/video về di sản đã lưu trữ.

## 2. Interactive / Judge View (Auth Required)
- `/dashboard` - **Live Control Center**:
    - **Live Map**: Vị trí hiện tại của Robot trên sa bàn.
    - **Telemetry**: Trạng thái pin, kết nối AI Brain, kết nối MQTT.
- `/dashboard/stations/[id]` - **Station Detail**: Tự động chuyển trang khi Robot tới trạm.
    - **Virtual Tour**: Video 360/Hình ảnh tư liệu.
    - **Interactive Quiz**: Bộ câu hỏi tương tác.
- `/dashboard/controls` - **Manual Override**: Bảng điều khiển thủ công cho kỹ thuật viên.

## 3. Admin / System View
- `/admin/setup` - **Configuration**: Cấu hình các Station ID và MQTT Topics.
- `/admin/db-monitor` - **Logs**: Xem hàng đợi lệnh (Command Queue) thời gian thực.

---

## 🎨 Design Language
- **Theme:** Dark Mode (Future Innovators style).
- **Aesthetics:** Glassmorphism, Neon Accents, Smooth Transitions (Framer Motion).
