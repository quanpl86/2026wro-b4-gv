import cv2
import cv2.aruco as aruco
import os

def generate_markers():
    # Folder to save markers
    output_dir = "assets/markers"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 Created directory: {output_dir}")

    # Use the same dictionary as in vision_service.py
    aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)

    # Site mapping
    sites = {
        0: "Trang_An",
        1: "Cot_Co",
        2: "Chua_Mot_Cot"
    }

    print("🎨 Generating ArUco Markers...")

    for marker_id, name in sites.items():
        # Create marker image
        # Parameters: dictionary, marker_id, size_in_pixels
        marker_img = aruco.generateImageMarker(aruco_dict, marker_id, 400)
        
        # Save image
        file_path = os.path.join(output_dir, f"marker_{marker_id}_{name}.png")
        cv2.imwrite(file_path, marker_img)
        print(f"✅ Generated: {file_path}")

    print("\n🚀 Markers generated successfully! You can find them in: /Users/mac/Downloads/WRO-GV2026/apps/ai-brain/assets/markers")

if __name__ == "__main__":
    generate_markers()
