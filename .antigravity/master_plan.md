# 🏁 ANTIGRAVYTI MASTER PLAN (WRO 2026)

> **QUY ĐỊNH BẮT BUỘC:** Mọi AI Agent khi bắt đầu phiên làm việc hoặc tham gia vào dự án PHẢI đọc và nắm rõ Master Plan này để đảm bảo sự nhất quán trong triển khai.

## 🎯 1. Executive Vision
Biến các sa bàn di sản tĩnh thành một **Hệ sinh thái di sản sống động** (Phygital System). Robot không chỉ là thiết bị di chuyển mà còn là một hướng dẫn viên thông minh, kết nối thế giới vật lý với không gian kỹ thuật số qua Web và AI.

## 🏗️ 2. Hệ Sinh Thái Công Nghệ (Infrastructure)
Dự án được xây dựng trên mô hình Monorepo chia làm 3 mảng chính:

| Module | Công Nghệ | Vai Trò |
| :--- | :--- | :--- |
| **Web App** | Next.js 14, Tailwind, Supabase | Giao diện tương tác cho giám khảo/khách tham quan. |
| **AI Brain** | Python, OpenCV, Vosk, MQTT | Bộ não local xử lý Thị giác, Thính giác và Logic điều phối. |
| **Hardware** | EV3 (MicroPython), ESP32 (C++) | Cánh tay thực thi (Di chuyển Robot và Hiệu ứng ánh sáng). |

---

## 📅 3. Lộ Trình Triển Khai (Roadmap)

### Phase 1: Foundation & Core Setup [DONE]
- [x] Monorepo structure initialization (Next.js & Python).
- [x] AI Agent detailed job descriptions and storage plan.
- [x] Master Plan & Mandatory protocols established.
- [x] Personas JSON & Task Boards defined for all 9 Agents.

### Phase 2: Connectivity & Synergy [DONE]
- [x] **Real-time Bridge:** Supabase client initialized for Web & Python.
- [x] **Audio/Vision Foundation:** OpenCV, Vosk, Pyaudio (verified).
- [x] **Security:** .env protocols and RLS foundation.
- [x] **Cloud Sync:** GitHub Repository linked and first push completed.

### Phase 3: Intelligence & Physical Action [CURRENT]
- [x] **EV3 Priority Test:** Xây dựng UI điều khiển động cơ và kiểm tra luồng MQTT từ Web -> Robot.
- [x] **Hardware Control:** Robot di chuyển mượt mà, tốc độ cao (600mm/s), độ trễ thấp.
- [x] **Keyboard Mapping:** Đồng bộ phím bấm bàn phím với các lệnh điều khiển Robot.
- [ ] **Vision Module:** Nhận diện mô hình qua camera laptop.
- [ ] **Voice Module:** Tiếp nhận khẩu lệnh tiếng Việt Offline.
- [ ] **Emotional LED:** LED NeoPixel phản ánh trạng thái robot.

### Phase 4: Polish & Performance
- [ ] Thiết kế UI "Future Innovators" (Premium glassmorphism).
- [ ] Tối ưu hóa độ trễ phản hồi hệ thống < 200ms.
- [x] **Deployment:** Cấu hình `netlify.toml` sẵn sàng cho CI/CD.

### Phase 5: Independence & Standalone Deployment [FUTURE]
- [ ] **Hardware Bridge:** Thay thế Laptop bằng **Raspberry Pi** cài đặt sẵn `AI Brain Bridge`.
- [ ] **Cloud MQTT:** Chuyển đổi từ MQTT Local sang **HiveMQ Cloud/EMQX Cloud** để Robot kết nối Internet trực tiếp.
- [ ] **Mobile Control:** Tối ưu hóa giao diện điều khiển trên điện thoại (4G/5G).

---

## 🛠️ 4. Quy Trình Làm Việc & Ngôn Ngữ (Protocols)
1.  **Giao tiếp 100% Tiếng Việt:** Toàn bộ quá trình thảo luận, kế hoạch và báo cáo giữa các Agent và User phải sử dụng tiếng Việt chuyên nghiệp.
2.  **Xác thực đa tầng:** 
    - Sau khi hoàn thành Task: Nhờ User review.
    - Sau khi hoàn thành Phase: Nhờ User xác nhận tổng thể.
3.  **Git Commitment:** Ngay sau khi công việc được User xác nhận hoàn thành (Approve), Agent có trách nhiệm nhắc nhở User thực hiện `git commit` và `git push` để đảm bảo an toàn dữ liệu.

## ⚙️ 5. Core Technical Standards
1.  **Unified Source of Truth:** Mọi cấu hình Station ID, MQTT Topic phải lấy từ `packages/shared-config/config.json`.
2.  **Stateless Hardware:** Robot không giữ logic phức tạp, chỉ thực thi lệnh từ Commander.
3.  **Real-time First:** Ưu tiên Supabase Realtime cho các sự kiện UI và MQTT cho các lệnh phần cứng.
4.  **Premium Aesthetics:** Giao diện Web phải mang tính hiện đại, tương lai để WOW người xem.

## 🚥 5. Key Performance Indicators (KPIs)
- **Latent:** Thời gian từ khi AI nhận diện đến khi Robot hành động < 500ms.
- **Accuracy:** Độ chính xác nhận diện Voice/Vision > 90%.
- **Sync:** Trạng thái trên Web và vị trí thực của Robot đồng bộ 100%.
