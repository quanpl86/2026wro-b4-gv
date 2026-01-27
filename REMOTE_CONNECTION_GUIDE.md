# 🌐 Hướng Dẫn Cấu Hình Kết Nối Từ Xa (Ngrok Tunnel)

Tài liệu này hướng dẫn chi tiết cách thiết lập hệ thống **Hybrid Connection** cho dự án WRO 2026.
Hệ thống này cho phép:
1.  **iPad/iPhone** truy cập Camera & Vision (Yêu cầu HTTPS).
2.  **Robot EV3** nhận lệnh điều khiển từ xa qua mạng Internet (Secure WebSocket).
3.  **Laptop Giám Khảo** vẫn hoạt động song song trên mạng nội bộ.

---

## 🏗️ 1. Nguyên Lý Hoạt Động

Do cơ chế bảo mật của trình duyệt (Browser Security):
*   **Camera** chỉ hoạt động trên `https://` (hoặc `localhost`).
*   Trang web `https://` **KHÔNG THỂ** kết nối tới WebSocket thường (`ws://`). Bắt buộc phải dùng `wss://` (Secure WebSocket).

👉 **Giải pháp:** Sử dụng **Ngrok** để tạo một đường hầm bảo mật (SSL Tunnel) từ Internet vào máy tính local của bạn.

---

## 🛠️ 2. Chuẩn Bị (Làm 1 lần đầu tiên)

### Bước 1: Cài đặt Ngrok
Nếu chưa cài, chạy lệnh sau trong Terminal:
```bash
npm install -g ngrok
# Hoặc nếu dùng npx thì không cần cài
```

### Bước 2: Đăng ký & Lấy Token
1.  Đăng ký tài khoản miễn phí tại [dashboard.ngrok.com](https://dashboard.ngrok.com/signup).
2.  Lấy **Authtoken** tại mục "Your Authtoken".
3.  Chạy lệnh đăng nhập trên máy tính:
    ```bash
    npx ngrok config add-authtoken <TOKEN_CUA_BAN>
    ```

---

## 🚀 3. Quy Trình Khởi Động Hằng Ngày

Để hệ thống hoạt động, bạn cần mở **3 cửa sổ Terminal** chạy song song.

### ✅ Terminal 1: Khởi động MQTT Broker (Quan trọng)
Đây là bưu điện trung chuyển tin nhắn cho Robot. Phải chạy bằng lệnh này để mở cổng kết nối LAN.
```bash
# Tắt service cũ nếu có
killall mosquitto
# Chạy thủ công
/opt/homebrew/sbin/mosquitto -c mosquitto_test.conf -v
```
*Dấu hiệu thành công: Hiện dòng `Opening ipv4 listen socket on port 1883`.*

### ✅ Terminal 2: Khởi động AI Brain (Server)
Đây là trung tâm xử lý lệnh và kết nối Robot EV3.
```bash
cd apps/ai-brain
./venv/bin/python command_listener.py
```
*Lưu ý: Giữ cửa sổ này luôn mở.*

### ✅ Terminal 3: Khởi động Đường Hầm Ngrok
Lệnh này sẽ public cổng WebSocket (8765) ra ngoài Internet dưới dạng HTTPS/WSS.
```bash
npx ngrok http 8765
```
Sau khi chạy, màn hình sẽ hiện ra bảng trạng thái. Hãy chú ý dòng `Forwarding`:
> Forwarding **https://xxxx-xxxx.ngrok-free.dev** -> http://localhost:8765

👉 **Copy địa chỉ miền này** (ví dụ: `xxxx-xxxx.ngrok-free.dev`).

### ✅ Bước 3: Cập Nhật Địa Chỉ Vào Hệ Thống
Vì Ngrok bản miễn phí sẽ đổi tên miền mỗi lần tắt bật, bạn cần cập nhật địa chỉ mới để App biết đường kết nối.

**CÁCH 1 (KHUYÊN DÙNG - NHANH NHẤT):**
1.  Trên Laptop, mở web: `http://localhost:3000/dashboard/robot-settings`
2.  Paste link Ngrok vừa copy vào ô **"AI Brain (Hub) IP Address"** (đừng quên bỏ `https://`).
3.  Bấm nút **LƯU CẤU HÌNH** ở dưới cùng.
    *   *Lưu ý: Hệ thống sẽ tự động đồng bộ sang iPad/iPhone ngay lập tức.*

**CÁCH 2 (THỦ CÔNG - DATABASE):**
1.  Vào **Supabase Dashboard** -> Table `robot_profiles`.
2.  Tìm dòng Profile đang active (thường là EV3).
3.  Sửa cột **`hub_ip`** thành tên miền vừa copy.

> [!IMPORTANT]
> **🔴 LƯU Ý QUAN TRỌNG:**
> Khi link Ngrok thay đổi (do tắt máy bật lại), bạn **CHỈ CẦN cập nhật lại Database** (Bước 3).
> **TUYỆT ĐỐI KHÔNG CẦN DEPLOY LẠI WEB!**
> Web App sẽ tự động tải địa chỉ mới từ Database về để kết nối.

*(Nếu bạn dùng bản Ngrok trả phí hoặc dùng miền cố định Static Domain, bạn chỉ cần làm bước này 1 lần duy nhất).*

---

## 📱 4. Cách Truy Cập

### 💻 Trên Laptop (Giám Khảo)
*   Mở trình duyệt: `http://localhost:3000/judge`
*   Hệ thống sẽ tự động kết nối tới Robot qua đường hầm Ngrok (vì IP trong database là Ngrok).

### 🍎 Trên iPad/iPhone (Vision & Camera)
*   **Cách 1 (Khuyên dùng):** Truy cập link Netlify đã deploy (ví dụ: `https://wro-gv2026.netlify.app`).
*   **Cách 2 (Debug Local):** Nếu chưa deploy, dùng LocalTunnel cho port 3000:
    ```bash
    npx localtunnel --port 3000
    ```
    Mở link `loca.lt` trên điện thoại.

🔹 **Lần đầu truy cập trên điện thoại:**
Nếu Camera không bật hoặc Robot không nhận, có thể do màn hình cảnh báo của Ngrok chặn kết nối ngầm.
1.  Mở trình duyệt trên điện thoại.
2.  Vào thẳng link WebSocket: `https://xxxx-xxxx.ngrok-free.dev`
3.  Bấm nút **"Visit Site"** ở màn hình cảnh báo.
4.  Quay lại App Vision và reload -> **Thành công!** 🎉

---

## ❓ Xử Lý Lỗi Thường Gặp

| Biểu hiện | Nguyên nhân | Cách sửa |
| :--- | :--- | :--- |
| **Judge Offline** | Tắt mất Terminal Ngrok | Mở lại Terminal 2 và chạy `npx ngrok http 8765`. |
| **Camera không bật** | Dùng sai link HTTP thường | Bắt buộc truy cập qua link **HTTPS** (Netlify hoặc Localtunnel). Không dùng IP `192.168...` |
| **Lỗi Connection Refused** | Server Python chưa chạy | Kiểm tra Terminal 1 (`command_listener.py`) có đang chạy không. |
| **Mất kết nối sau 1 giờ** | Ngrok Free giới hạn | Tắt Ngrok (Ctrl+C) và chạy lại. Cập nhật lại IP trong Supabase. |

npx ngrok http 8765