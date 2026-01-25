## 1. Primary Mandate (Quy tắc tối thượng)
- **CRITICAL:** Mọi Agent khi bắt đầu tác vụ PHẢI đọc `master_plan.md` để nắm bắt tiến độ và mục tiêu hiện tại. Không được thực hiện các thay đổi phá vỡ kiến trúc đã định nghĩa trong Master Plan.

## 2. Communication & Language (Ngôn ngữ & Giao tiếp)
- **100% Tiếng Việt:** Mọi cuộc hội thoại giữa các AI Agent, mọi báo cáo, kế hoạch (Plan), và danh sách nhiệm vụ (Task) PHẢI được trình bày bằng TIẾNG VIỆT.
- **Tính Chuyên Nghiệp:** Ngôn ngữ sử dụng phải rõ ràng, chuyên nghiệp và bám sát thuật ngữ kỹ thuật nhưng vẫn dễ hiểu đối với User.

## 3. Workflow & Version Control (Quy trình & Git)
- **Xác thực từ User:** Sau khi hoàn thành mỗi Task hoặc mỗi Phase, Agent PHẢI thông báo cho User để kiểm tra và xác nhận.
- **Git Protocol:** Ngay sau khi User nhấn "Approve" hoặc xác nhận công việc hoàn thành, Agent PHẢI nhắc nhở User thực hiện **Commit** và **Push** mã nguồn lên GitHub để lưu trữ tiến độ.
- **Project Info & Instruction Sync:** Agent PHẢI cập nhật cả file `project_info.md` và `.antigravity/INSTRUCTION.md` sau khi hoàn thành hoặc hiệu chỉnh bất kỳ chức năng nào của dự án để đảm bảo tài liệu luôn khớp với thực tế triển khai.

## 4. Unified Configuration
- NEVER hardcode values like MQTT topics or Station IDs in separate files.
- ALWAYS use `packages/shared-config/config.json`.

## 2. Language & Tone
- Web Content: Vietnamese (Official & Engaging).
- Code/Comments: English (Professional).
- AI Voice: Natural Vietnamese TTS.

## 3. Interaction Standards
- **Wait Time:** AI Bridge (Observer/Listener) should have a cooldown of 2 seconds after a command to prevent message flooding.
- **Safety:** EV3 units must stop immediately if `robot_action` is changed to `manual` in `system_status`.

## 4. Coding Style
- **TypeScript:** Strict mode, use interfaces for all data structures.
- **Python:** PEP8, Type hinting for all functions.
- **Hardware:** Micro-controllers (ESP32) should use non-blocking delays (millis).
