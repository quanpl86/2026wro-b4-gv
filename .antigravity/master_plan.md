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
| **Hardware** | EV3 (MicroPython), ESP32 (C++) | **Mobile:** Social Robot (2 Arms, Fixed Cam).<br>**Stations:** 2x Controllers (4 Motors each).<br>**Light:** 1x ESP32. |

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

### Phase 3: Intelligence & Physical Action [DONE]
- [x] **Advanced Robot Control Suite:**
    - [x] Create `robot_profiles` table in Supabase.
    - [x] Build Configuration UI (Port Mapping, Speeds).
    - [x] Implement Advanced Motor Control Panel (Rotations/Degrees).
    - [x] Implement Sensor Feedback System (Infrastructure ready).
- [x] **System Tuning & Configuration:**
    - [x] Move Aux Motor settings to Settings page.
    - [x] Simplify Aux Motor control panel.
    - [x] Update Robot Profile to store Aux Motor & Sensor config.
    - [x] Optimize Landscape Mode for mobile.
    - [x] Implement Inline Notifications.
    - [x] Fix EV3 Hard Brake & State Conflict issues.
- [x] **'The Observer' v1:** Verify Python Vision Logic.

### Phase 4: The Observer 2.0 (QR Vision Upgrade) [DONE]
- [x] Build dedicated `/vision` page on Web App.
- [x] **Upgrade:** Migrated from ArUco to `jsQR` for ultra-robust detection.
- [x] Implement high-speed WebSocket (Hub <-> Browser) with telemetry broadcast.

### Phase 5: The Storyteller 2.0 (Interactive Judge Portal) [DONE]
- [x] Dashboard tương tác cho Giám khảo (iPad Layout) với bảo mật PIN (2026).
- [x] Tích hợp bản đồ Live Journey Mapping (SVG/Canvas) theo thời gian thực.
- [x] Hệ thống Mini-games (Quiz, Multimedia FlipBook, Digital Badges) tại trạm dừng.
- [x] Hệ thống Lưu trữ Game Session & Kết quả thi đấu nâng cao.

### Phase 6: Core AI & Distributed Hub [DONE]
- [x] Triển khai AI Assistant (Voice Chat & Gemini LLM) trên Tablet.
- [x] Nâng cấp Bản đồ: Adaptive Map Editor & Cloud Image Hosting (Supabase Storage).
- [x] Hệ thống Responsive Map Calibration (Chống lệch vị trí đa thiết bị).
- [x] Video-based Mascot Engine: Biểu cảm sống động 9:16 đồng bộ với cảm xúc robot.
- [x] Game Loop Orchestration: Kích hoạt Quiz/Media dựa trên vị trí robot.

### Phase 7: Multi-Robot Orchestration (Mobile & Static) [DONE]
- [x] **Kiến trúc Connectivity:** Laptop Hub kết nối đa thiết bị qua MQTT.
- [x] **Station Logic:** Viết `station_node.py` cho EV3 Controller điều khiển trạm di sản.
- [x] **Orchestration Workflow:** AI Brain tự động dừng Robot di động và kích hoạt Trạm khi phát hiện địa danh.
- [x] **Dashboard Sync:** Hiển thị trạng thái Online/Busy của các trạm thời gian thực.

### Phase 7.5: Phygital Resilience & Idle AI [DONE]
- [x] **System Resilience:** Mascot phản ứng với trạng thái Pin yếu và Mất kết nối (Angry/Sleepy).
- [x] **Idle Behaviors:** Robot tự động chớp mắt/nhìn quanh khi không có lệnh (Micro-animations).
- [x] **Node Hardening:** Triển khai MQTT Last Will & Testament cho toàn bộ hệ thống phần cứng.

### Phase 8: Triển khai & Hoàn thiện (The Grand Finale) [DONE]
- [x] **Leaderboards:** Xây dựng Bảng xếp hạng điểm số real-time tích hợp Supabase.
- [x] **Optimization:** Tối ưu hóa độ trễ (Latency) và nén tài nguyên video/audio.
- [ ] **Final Field Test:** Chạy thử nghiệm toàn bộ kịch bản 4 trạm di sản liên tục.

### Phase 9: The Extended Reality (XR) & Immersive Expansion [IN PROGRESS]
- [x] **Phase 9.1: Spatial UI & 3D Arena**
    - [x] Implement Precision Map Interaction (Zoom, Pan, Move Mode).
    - [x] Refactor VoiceAssistant UI (Consolidated Settings Popover).
    - [x] Implement Dynamic Sidebar Resize & AI Scaling.
    - [ ] Refactor `ImmersiveArena` to 3D perspective (CSS 3D/Three.js).
- [ ] **Phase 9.2: Gemini Multimodal Vision (The AI Eye)**
    - [ ] Implement Frame-to-AI pipeline (Smartphone Cam -> AI Brain).
    - [ ] Add Scene Description capabilities to Gemini System Prompt.
    - [ ] Emotional Voice Synthesis tuning.
- [ ] **Phase 9.3: Heritage Gamification (The Digital Passport)**
    - [ ] Create `DigitalPassport` component with 3D Stamp animations.
    - [ ] Implement Heritage Token reward system.
    - [ ] Add "AR Heritage Portal" (Overlaid 3D visuals on live camera feed).

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
