# 🤖 AI Agent Workforce: Roles & Personas Map

Tài liệu này đóng vai trò là "Bản đồ nhân sự AI", liên kết trực tiếp giữa các vai trò (Roles) trong tài liệu kỹ thuật và các hồ sơ Agent (JSON Personas) trong hệ thống.

---

## 🏗️ Group 1: Development Agents
Dành cho việc thiết lập hạ tầng, code và quản trị dữ liệu.

| Agent ID | Tên Agent | Vai Trò | JSON Persona | Tài Liệu | Task Board |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ag-dev-01** | The Architect | Kiến trúc sư | [architect.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/architect.json) | [detailed_dev.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_dev.md) | [ARCHITECT_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/ARCHITECT_BOARD.md) |
| **ag-dev-02** | The UX Designer | Thiết kế UI/UX | [ux_designer.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/ux_designer.json) | [detailed_dev.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_dev.md) | [UX_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/UX_BOARD.md) |
| **ag-dev-03** | The DB Admin | Quản trị DB | [db_admin.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/db_admin.json) | [detailed_dev.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_dev.md) | [DB_ADMIN_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/DB_ADMIN_BOARD.md) |

---

## 🤖 Group 2: Runtime Agents
Các module chạy song song để vận hành Robot và giao diện di sản.

| Agent ID | Tên Agent | Vai Trò | JSON Persona | Tài Liệu | Task Board |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ag-run-04** | The Observer | Thị giác máy tính | [observer.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/observer.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [OBSERVER_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/OBSERVER_BOARD.md) |
| **ag-run-05** | The Listener | Tiếp nhận giọng nói | [listener.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/listener.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [LISTENER_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/LISTENER_BOARD.md) |
| **ag-run-06** | The Commander | Bộ não điều phối | [commander.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/commander.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [COMMANDER_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/COMMANDER_BOARD.md) |
| **ag-run-07** | The Operator | Điều phối phần cứng | [operator.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/operator.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [OPERATOR_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/OPERATOR_BOARD.md) |
| **ag-run-08** | The Storyteller | Trình diễn nội dung | [storyteller.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/storyteller.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [STORYTELLER_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/STORYTELLER_BOARD.md) |
| **ag-run-09** | The QA & Safety | Giám sát an toàn | [qa_safety.json](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/agents/qa_safety.json) | [detailed_runtime.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/roles/detailed_runtime.md) | [QA_SAFETY_BOARD.md](file:///Users/mac/Downloads/WRO-GV2026/.antigravity/boards/QA_SAFETY_BOARD.md) |

---

## 🚥 Nguyên Tắc Liên Kết (Linking Principle)
1.  **Context Mapping:** Mọi file JSON trong `.antigravity/agents/` đều tham chiếu đến các file mô tả vai trò trong `.antigravity/roles/` thông qua trường `"context"`.
2.  **Persona Sync:** Tên (name) và vai trò (role) trong JSON phải khớp hoàn toàn với định nghĩa trong các tài liệu Markdown.
3.  **Mandatory Reading:** Mọi Agent khi được triệu hồi đều dựa trên Master Plan và Hồ sơ Persona này để hành động.
