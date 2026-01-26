# 🤖 EV3 Station Robot - Quy Trình Vận Hành (Bluetooth PAN)

Tài liệu này hướng dẫn chi tiết cách thiết lập, kết nối và vận hành các Robot Trạm (Static Stations) sử dụng kết nối Bluetooth Personal Area Network (PAN) để nhận lệnh từ AI Brain (Mac Hub).

---

## 🛠️ 1. Chuẩn Bị & Cài Đặt (Initial Setup)

### A. Chuẩn bị phần cứng (Per Station)
-   1x LEGO Mindstorms EV3 Brick.
-   1x Thẻ nhớ MicroSD (loại 4GB - 32GB).
-   1x USB Bluetooth Dongle (nếu EV3 không nhận Bluetooth tích hợp tốt, nhưng thường tích hợp là đủ).
-   Cáp mini-USB (để cấu hình lần đầu).

### B. Flash hệ điều hành ev3dev
1.  Tải image `ev3dev-stretch` mới nhất từ [ev3dev.org](https://www.ev3dev.org/downloads/).
2.  Sử dụng **Etcher** để flash image vào thẻ nhớ MicroSD.
3.  Cắm thẻ nhớ vào EV3 và khởi động. Chờ đến khi đèn chuyển xanh và menu hiện lên.

---

## 📡 2. Kết Nối Mạng (Bluetooth Tethering)

Đây là bước quan trọng nhất để đưa EV3 vào mạng IP mà không cần USB WiFi.

### A. Trên Máy Chủ (Mac Hub)
1.  Vào `System Settings` -> `General` -> `Sharing`.
2.  Bật **Internet Sharing**.
3.  Trong phần "Share your connection from", chọn **Wi-Fi** (hoặc Ethernet nếu có).
4.  Trong phần "To computers using", tích chọn **Bluetooth PAN**.
5.  _(Lưu ý: Nếu máy Mac đã kết nối WiFi, nó sẽ chia sẻ mạng đó cho EV3. Nếu không, nó sẽ tạo một mạng nội bộ Local giữa Mac và EV3, vẫn đủ để chạy MQTT)._

### B. Trên EV3 Brick
1.  Vào menu `Wireless and Networks` -> `Bluetooth`.
2.  Đảm bảo `Powered` được tích chọn.
3.  Chọn `Start Scan`.
4.  Tìm tên máy Mac của bạn trong danh sách -> Chọn `Pair`.
5.  Xác nhận mã PIN trên cả EV3 và Mac (thường là tự động hoặc `1234`).
6.  Sau khi Pair thành công, chọn tên máy Mac trong danh sách thiết bị đã Pair -> Chọn **Network Connection**.
7.  Quan sát góc trên bên trái màn hình EV3: Biểu tượng `<->` sẽ sáng lên.
8.  Quay lại màn hình chính, bạn sẽ thấy địa chỉ IP (ví dụ: `192.168.2.x`) hiện lên ở góc trên cùng. **Ghi lại IP này.**

---

## 🚀 3. Triển Khai Code (Deployment)

### A. Cấu trúc thư mục trên EV3
Mỗi trạm sẽ cần một thư mục chứa code và thư viện.
Khuyến nghị dùng **VS Code** với Extension **LEGO Mindstorms EV3 MicroPython** để deploy, hoặc dùng `scp`.

Đường dẫn: `/home/robot/station_node/`
-   `main.py`: Code logic chính (MQTT Listener).
-   `config.json`: Cấu hình ID trạm và MQTT Broker IP.

### B. Copy Code (Cách dùng SCP)
Từ Terminal máy Mac:
```bash
# Copy file code
scp apps/hardware/ev3_station/main.py robot@192.168.2.x:/home/robot/station_node/
scp packages/shared-config/config.json robot@192.168.2.x:/home/robot/station_node/
```
*(Mật khẩu mặc định của ev3dev là `maker`)*

### C. Chạy và kiểm tra
SSH vào robot:
```bash
ssh robot@192.168.2.x
cd /home/robot/station_node/
python3 main.py
```
Nếu thành công, màn hình sẽ hiện: `Connected to MQTT Broker`.

---

## 🕹️ 4. Quy Trình Vận Hành Hàng Ngày (Daily Routine)

1.  **Bật nguồn:** Khởi động tất cả EV3 Station và Mac Hub.
2.  **Kết nối:**
    -   Trên EV3: Vào Bluetooth -> Chọn Mac -> Connect Network.
    -   Kiểm tra: Thấy IP hiện lên màn hình.
3.  **Khởi chạy Hub:** Chạy `npm start` (Web) và `python command_listener.py` (Brain) trên Mac.
4.  **Khởi chạy Trạm:** 
    -   SSH vào từng trạm và chạy `python3 main.py`.
    -   Hoặc cấu hình `systemd` service để tự chạy khi boot (Khuyên dùng cho thi đấu).

---

## 🔧 5. Troubleshooting (Khắc phục sự cố)

| Vấn đề | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Không thấy IP trên EV3** | Chưa bật Internet Sharing hoặc chưa chọn 'Connect Network' trên EV3. | Kiểm tra lại Setting Sharing trên Mac. Trên EV3, Disconnect rồi Connect lại. |
| **IP lạ (169.254.x.x)** | DHCP thất bại. | Restart Bluetooth trên cả 2 thiết bị. Tắt/Bật lại Internet Sharing. |
| **Kết nối chập chờn** | Nhiễu sóng hoặc khoảng cách xa. | Đảm bảo EV3 trong bán kính 5-10m quanh Mac. Tránh vật cản kim loại. |
| **Lỗi `Connection Refused` MQTT** | Sai IP Broker trong config. | Kiểm tra IP máy Mac (`ipconfig getifaddr en0`) và cập nhật vào `config.json` trên EV3. |
| **Latency cao (>1s)** | Băng thông Bluetooth đầy. | Giảm tần suất gửi tin nhắn (heartbeat). Chỉ gửi lệnh cần thiết. |

---

## 📝 6. Ghi Chú Kỹ Thuật
-   **Broker IP:** Khi dùng Bluetooth PAN, IP của Mac nhìn từ EV3 thường là IP của interface Bridge (ví dụ `192.168.2.1`). Hãy dùng `ifconfig` trên Mac để tìm interface `bridge100` (hoặc tương tự) để lấy chính xác IP Gateway này.
