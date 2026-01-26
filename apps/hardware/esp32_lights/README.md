# 💡 ESP32 Lights Controller - Hướng Dẫn Cài Đặt

Dự án này được cấu hình chuẩn cho **PlatformIO**, nhưng bạn cũng có thể dùng **Arduino IDE** truyền thống nếu muốn.

---

## 🅰️ Cách 1: Sử dụng PlatformIO (Khuyên dùng)
Đây là cách chuyên nghiệp, tự động tải thư viện.

1.  **Cài đặt Extension:**
    -   Nhìn sang thanh bên trái của VS Code / Cursor, tìm biểu tượng **Extensions** (hình 4 ô vuông).
    -   Gõ vào ô tìm kiếm: `PlatformIO IDE`.
    -   Chọn kết quả đầu tiên (có icon hình đầu người ngoài hành tinh 👽) và bấm **Install**.
    -   *Lưu ý: Sau khi cài, bạn có thể cần khởi động lại Editor.*

2.  **Mở Dự Án:**
    -   Sau khi cài xong, bấm vào biểu tượng Alien 👽 ở thanh bên trái.
    -   Chọn **Pick Project Folder** và trỏ đến thư mục `apps/hardware/esp32_lights`.
    -   Chờ vài phút để nó tải thư viện `PubSubClient`.

3.  **Nạp Code:**
    -   Bấm nút mũi tên ➡️ (Upload) ở dưới cùng thanh trạng thái để nạp code vào ESP32.

---

## 🅱️ Cách 2: Sử dụng Arduino IDE (Dự phòng)
Nếu bạn không cài được PlatformIO, hãy làm theo cách sau:

1.  **Đổi tên file:**
    -   Vào thư mục `src`, đổi tên `main.cpp` thành `esp32_lights.ino`.
    -   Di chuyển file `esp32_lights.ino` ra ngoài thư mục cha `apps/hardware/esp32_lights/`.
    -   Xóa thư mục `src` đi.

2.  **Sửa Code:**
    -   Mở file `.ino` bằng Arduino IDE.
    -   Xóa dòng đầu tiên: `#include <Arduino.h>` (Arduino IDE tự động thêm dòng này rồi, để lại sẽ lỗi).

3.  **Cài Thư Viện:**
    -   Trong Arduino IDE, vào `Sketch` -> `Include Library` -> `Manage Libraries`.
    -   Tìm và cài `PubSubClient`.

4.  **Nạp Code:**
    -   Chọn Board ESP32 Dev Module và bấm Upload.
