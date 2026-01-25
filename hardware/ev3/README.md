# 🤖 Hướng dẫn thiết lập LEGO EV3 (MicroPython)

Tài liệu này hướng dẫn cách chuẩn bị và chạy code điều khiển Robot EV3 trong dự án Antigravyti.

---

## 🛠️ 1. Chuẩn bị phần cứng & phần mềm

### A. Cài đặt hệ điều hành (ev3dev)
1. Tải image **ev3dev-stretch** tại [ev3dev.org](https://www.ev3dev.org/downloads/).
2. Sử dụng **Etcher** để flash image vào thẻ nhớ MicroSD (tối thiểu 4GB).
3. Cắm thẻ nhớ vào EV3 và khởi động.

### B. Cấu hình WiFi
1. Trên gạch EV3, vào mục **Wireless and Networks** -> **Wi-Fi**.
2. Chọn **Powered** và tìm mạng WiFi của bạn để kết nối.
3. Ghi lại địa chỉ IP hiển thị trên màn hình EV3 (ví dụ: `192.168.1.100`).

### C. Cài đặt VS Code (Trên máy tính)
1. Cài đặt extension **EV3 MicroPython** của LEGO Education.
2. Mở thư mục `hardware/ev3` trong VS Code.
3. Nhấn vào tab **EV3 DEVICE BROWSER** ở góc dưới bên trái, chọn **Click here to connect to a device** và nhập IP của EV3.

---

## 🚀 2. Chạy Code điều khiển

### Cách 1: Sử dụng VS Code (Khuyên dùng)
1. Mở thư mục `hardware/ev3` bằng VS Code.
2. Mở tab **EV3 DEVICE BROWSER** (biểu tượng viên gạch ở thanh bên trái).
3. Chọn thiết bị đã kết nối.
4. Nhấn phím **F5** để tự động tải code và chạy.

### Cách 2: Sử dụng Terminal (Dành cho chuyên gia)
Nếu bạn đã biết địa chỉ IP của EV3 (ví dụ: `192.168.1.100`), bạn có thể dùng lệnh `scp` để nạp file:
```bash
scp main.py robot@192.168.1.100:/home/robot/ev3_project/
```
*(Password mặc định của ev3dev là: `maker`)*

---

## 🕹️ 3. Kiểm tra lệnh
## 🛠️ 4. Xử lý sự cố (Troubleshooting)

### Lỗi EHOSTUNREACH trên macOS
Nếu bạn gặp lỗi `Failed to connect to ev3dev: connect EHOSTUNREACH` khi dùng VS Code, hãy thử cấu hình lại IPv6:

1. Vào **System Preferences > Network**.
2. Chọn kết nối đang dùng (WiFi hoặc USB).
3. Chọn **Advanced...** -> Tab **TCP/IP**.
4. Chuyển **Configure IPv6** thành **Link-local only**.
5. Nhấn **OK** -> **Apply**.
6. (Tùy chọn) Chuyển ngược lại thành **Automatically** nếu cần, nhưng thường để Link-local only sẽ ổn định hơn cho EV3.
