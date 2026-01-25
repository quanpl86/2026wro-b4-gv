import qrcode
import os

def generate_qr(data, filename):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    output_dir = "apps/web-app/public/qrs"
    os.makedirs(output_dir, exist_ok=True)
    
    path = os.path.join(output_dir, filename)
    img.save(path)
    print(f"Generated: {path}")

sites = [
    "Tràng An",
    "Cột Cờ Kỳ Đài",
    "Chùa Một Cột"
]

for i, name in enumerate(sites):
    generate_qr(name, f"qr_site_{i}.png")
