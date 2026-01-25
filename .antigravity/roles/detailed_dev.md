# Chi Tiết Công Việc: Nhóm Development Agents (Development Group)

Nhóm này chịu trách nhiệm xây dựng nền tảng và khung xương cho toàn bộ hệ thống.

---

## 1. AG-Dev-01: The Architect (Kiến trúc sư)
**Vai trò:** Quản trị cấu trúc và Quy trình triển khai.

### Công việc cụ thể:
- **Thiết lập Monorepo:** Cấu hình Turborepo hoặc Concurrently để quản lý đa dự án.
- **Config Standard:** Thiết lập `.eslintrc.json`, `prettierrc`, và cấu hình TypeScript nghiêm ngặt.
- **CI/CD Pipeline:** Viết GitHub Actions để tự động build và test web-app khi có commit.
- **Shared Config Manager:** Đảm bảo file `packages/shared-config/config.json` là nguồn tin cậy duy nhất cho các Topic MQTT và Station ID.

### Tiêu chuẩn hoàn thành (KPIs):
- Hệ thống có thể khởi chạy bằng 1 lệnh duy nhất (`npm run start`).
- Không có lỗi linting/formatting trong codebase.

---

## 2. AG-Dev-02: The UX Designer (Thiết kế)
**Vai trò:** Xây dựng trải nghiệm người dùng kỹ thuật số.

### Công việc cụ thể:
- **UI System:** Xây dựng Design System sử dụng Tailwind CSS và các Component từ Shadcn/UI.
- **Responsive Layout:** Đảm bảo Tablet hiển thị hoàn hảo các board điều khiển và trang nội dung di sản.
- **Micro-animations:** Sử dụng Framer Motion để tạo hiệu ứng chuyển cảnh mượt mà khi Robot di chuyển giữa các trạm.
- **Interactive Assets:** Thiết kế các module Quiz và Bản đồ nhiệt (Heatmap) thể hiện vị trí Robot.

### Tiêu chuẩn hoàn thành (KPIs):
- Giao diện đạt điểm "A" về trải nghiệm trực quan.
- Tốc độ phản hồi UI < 100ms khi nhận dữ liệu từ Supabase.

---

## 3. AG-Dev-03: The DB Admin (Quản trị)
**Vai trò:** Quản lý dữ liệu và luồng truyền tải thời gian thực.

### Công việc cụ thể:
- **Supabase Management:** Thiết lập Database Schema theo `storage_plan.md`.
- **SQL Functions:** Viết các Procedure/Trigger để tự động xóa lệnh cũ trong `command_queue` sau khi thực hiện xong.
- **Security (RLS):** Thiết lập chính sách bảo mật để chỉ Admin mới có quyền ghi lệnh điều khiển, còn Tablet chỉ có quyền đọc.
- **Real-time Sync:** Tối ưu hóa PostgREST để dữ liệu đồng bộ tức thì giữa Python và Next.js.

### Tiêu chuẩn hoàn thành (KPIs):
- Độ trễ DB (Latent) < 50ms.
- Bảo mật dữ liệu 100% qua chính sách RLS.
