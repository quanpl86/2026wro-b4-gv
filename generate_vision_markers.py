import numpy as np
import cv2
import os

def generate_js_aruco_marker(marker_id, size=400):
    # Parity patterns from js-aruco library
    ids = [ [1,0,0,0,0], [1,0,1,1,1], [0,1,0,0,1], [0,1,1,1,0] ]
    
    # Grid size (5x5 data + 1 bit black border + 1 bit white border = 9x9)
    grid = np.ones((9, 9), dtype=np.uint8) * 255 # Start with White
    
    # Inner 7x7 is the marker (black border + data)
    grid[1:8, 1:8] = 0 # Fill inner 7x7 with Black border
    
    # ID is 10 bits, split into 5 rows of 2 bits each
    bits = []
    temp_id = marker_id
    for _ in range(5):
        bits.insert(0, temp_id & 3)
        temp_id >>= 2
    
    # Fill the 5x5 data part (starting at index 2)
    for row in range(5):
        pattern = ids[bits[row]]
        for col in range(5):
            # 1 is white (255), 0 is black (0)
            grid[row+2, col+2] = 255 if pattern[col] == 1 else 0
            
    # Upscale to image size
    img = cv2.resize(grid, (size, size), interpolation=cv2.INTER_NEAREST)
    return img

output_dir = "apps/web-app/public/markers"
os.makedirs(output_dir, exist_ok=True)

sites = {
    0: "Trang_An",
    1: "Cot_Co",
    2: "Chua_Mot_Cot"
}

for mid, name in sites.items():
    img = generate_js_aruco_marker(mid)
    path = os.path.join(output_dir, f"marker_{mid}.png")
    cv2.imwrite(path, img)
    print(f"Generated: {path}")
