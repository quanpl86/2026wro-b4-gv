# Hướng dẫn tạo mã QR Di sản

Tài liệu này hướng dẫn cách tạo các mã QR chuẩn để Robot có thể nhận diện chính xác các trạm di sản trên bản đồ.

## 1. Công cụ sử dụng
Dự án sử dụng thư viện `qrcode` thông qua `npx` để đảm bảo định dạng chuẩn và tính tương thích cao nhất với trình quét của Robot.

## 2. Lệnh tạo mã
Mở terminal tại thư mục gốc của dự án và chạy lệnh sau (thay đổi nội dung ID tương ứng):

```bash
npx qrcode "ID_DIA_DANH" -o apps/web-app/public/qr_ID_DIA_DANH.png
```

## 3. Danh sách ID chuẩn (Snake Case)
Để hệ thống nhận diện đúng, nội dung bên trong mã QR phải **khớp hoàn toàn (case-sensitive)** với ID trong cấu hình. Sử dụng chữ thường và dấu gạch dưới:

| Trạm di sản | Nội dung mã QR (ID) |
| :--- | :--- |
| Tràng An | `trang_an` |
| Cột cờ Hà Nội | `cot_co` |
| Vịnh Hạ Long | `vinh_ha_long` |
| Phố cổ Hội An | `pho_co_hoi_an` |

## 4. Lưu ý quan trọng
- **Định dạng**: Luôn sử dụng chữ thường.
- **Kích thước**: Mặc định `npx qrcode` tạo ảnh đủ dùng, nếu cần to hơn để in ấn có thể thêm flag `-w 1000`.
- **Đường dẫn**: Nên lưu vào `apps/web-app/public/` để dễ quản lý và truy cập từ web.
