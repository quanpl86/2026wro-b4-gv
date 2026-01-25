# 🗄️ Database Schema & Roles

Tài liệu chi tiết về cấu trúc bảng, quan hệ dữ liệu và phân quyền bảo mật (RLS) trên Supabase.

## 1. Tables Definition

### Table: `system_status` (Singleton/Status)
- `id`: `uuid` (Primary Key)
- `current_station`: `text` (Foreign Key -> `stations.id`)
- `robot_state`: `enum` (moving, idle, speaking, error)
- `battery_level`: `float8`
- `ai_heartbeat`: `timestamp` (Dùng để QA-Safety kiểm tra kết nối)
- `updated_at`: `timestamptz`

### Table: `command_queue`
- `id`: `bigint` (Identity)
- `target`: `text` (ev3_robot, ev3_station, esp32)
- `command`: `text` (move, stop, light_on, rotate)
- `params`: `jsonb` (e.g., `{"speed": 50, "color": "#FF0000"}`)
- `status`: `enum` (pending, executing, completed, failed)
- `created_at`: `timestamptz`

### Table: `stations`
- `id`: `text` (Primary Key, e.g., "trang_an", "cot_co")
- `name_vn`: `text`
- `content_url`: `text`
- `metadata`: `jsonb`

### Table: `robot_profiles` (Configuration)
- `id`: `uuid` (Primary Key)
- `name`: `text` (e.g., "EV3 v1.0")
- `motor_ports`: `jsonb` (e.g., `{"left": "outB", "right": "outC", "aux1": "outA", "aux2": "outD"}`)
- `sensor_ports`: `jsonb` (e.g., `{"color": "in1", "ultrasonic": "in2"}`)
- `speed_profile`: `jsonb` (e.g., `{"forward": 100, "turn": 60}`)
- `aux_settings`: `jsonb` (Cấu hình bước quay cho Loader/Grappler)
- `key_mappings`: `jsonb` (Ánh xạ phím bàn phím: `"forward": "KeyW"`)
- `is_active`: `boolean`
- `updated_at`: `timestamptz`

---

## 2. Phân Quyền & RLS (Row Level Security)

### Roles:
- **`anon` (Public):** Chỉ có quyền ĐỌC dữ liệu từ `stations` và `system_status`. Không được gửi lệnh.
- **`authenticated` (Judges/Admin):**
    - Quyền ĐỌC/GHI vào `command_queue`.
    - Quyền CẬP NHẬT `system_status` (ở chế độ Manual).
- **`service_role` (AI Brain):** Full quyền để điều phối logic.

### RLS Policies (Ví dụ):
```sql
-- Chỉ cho phép service_role cập nhật heartbeat
CREATE POLICY "AI Brain Heartbeat" ON system_status 
FOR UPDATE USING (auth.role() = 'service_role');

-- Cho phép Admin gửi lệnh vào Queue
CREATE POLICY "Judge Commands" ON command_queue 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```
