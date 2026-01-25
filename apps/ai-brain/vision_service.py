import cv2
import cv2.aruco as aruco
import paho.mqtt.client as mqtt
import os
import time
import json
from dotenv import load_dotenv

# Load configurations
load_dotenv()
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
TOPIC_CMD = "wro/robot/commands"

# Mapping Marker IDs to Heritage Sites and Actions
SITES = {
    0: {"name": "Tràng An", "action": "stop"},
    1: {"name": "Cột Cờ Kỳ Đài", "action": "stop"},
    2: {"name": "Chùa Một Cột", "action": "stop"},
    17: {"name": "Test Marker (ID 17)", "action": "stop"},
    34: {"name": "Test Marker (ID 34)", "action": "stop"},
    42: {"name": "Test Marker (ID 42)", "action": "stop"}
}

# MQTT Setup
client = mqtt.Client()
try:
    client.connect(MQTT_BROKER, 1883, 60)
    print(f"✅ Connected to MQTT Broker: {MQTT_BROKER}")
except Exception as e:
    print(f"❌ Failed to connect to MQTT: {e}")

def send_robot_command(cmd):
    """Send command to robot via MQTT"""
    client.publish(TOPIC_CMD, cmd)
    print(f"📤 Sent Command: {cmd}")

def run_vision():
    # Initialize Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot open camera")
        return
    
    # TỐI ƯU 1: Cố định độ phân giải thấp để tăng tốc độ xử lý
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    # ArUco Settings (Tăng độ nhạy tối đa)
    aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
    parameters = aruco.DetectorParameters()
    
    # TINH CHỈNH ĐỘ NHẠY: Giúp nhận diện tốt hơn trên màn hình điện thoại
    parameters.adaptiveThreshWinSizeMin = 3
    parameters.adaptiveThreshWinSizeMax = 23
    parameters.adaptiveThreshWinSizeStep = 5 # Quét kỹ hơn
    parameters.adaptiveThreshConstant = 7
    parameters.minMarkerPerimeterRate = 0.05 # Nhận diện cả mã nhỏ/xa
    parameters.polygonalApproxAccuracyRate = 0.05
    
    detector = aruco.ArucoDetector(aruco_dict, parameters)

    print("👁️ The Observer is watching (Super Optimized Mode)...")
    
    # Khởi tạo các biến theo dõi
    last_detected_id = -1
    last_detection_time = 0
    frame_count = 0
    start_time = time.time()
    
    # Biến cho visual persistence (giữ khung hình mượt mà)
    persistence_counter = 0
    last_corners = None
    last_id_text = ""

    while True:
        ret, original_frame = cap.read()
        if not ret:
            print("⚠️ Failed to grab frame")
            break
        
        # Resize nhẹ để cân bằng giữa tốc độ và độ chính xác
        frame = cv2.resize(original_frame, (640, 480))
        
        frame_count += 1
        current_time = time.time()
        fps = frame_count / (current_time - start_time) if (current_time - start_time) > 0 else 0

        # Chuyển xám đơn giản (Bỏ equalizeHist vì gây lóa trên màn hình điện thoại)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect ArUco markers
        corners, ids, rejected = detector.detectMarkers(gray)

        # Mặc định trạng thái "Searching"
        status_color = (0, 0, 255) # Đỏ
        
        if ids is not None:
            status_color = (0, 255, 0) # Xanh lá
            persistence_counter = 10 # Giữ khung hình trong 10 frame tiếp theo
            
            for i in range(len(ids)):
                marker_id = int(ids[i][0])
                marker_corners = corners[i].reshape((4, 2)).astype(int)
                last_corners = marker_corners
                
                # Xác định tên di sản
                if marker_id in SITES:
                    site_name = SITES[marker_id]['name']
                else:
                    site_name = f"Unknown ({marker_id})"
                
                last_id_text = site_name

                # Logic điều khiển Robot (Debounce 2 giây)
                if marker_id != last_detected_id or (current_time - last_detection_time > 2):
                    print(f"🎯 LOCKED-ON [ID {marker_id}]: {site_name}")
                    send_robot_command("stop")
                    last_detected_id = marker_id
                    last_detection_time = current_time

        # Hiển thị PERSISTENCE (Khung hình giữ lại để tránh bị nháy)
        if persistence_counter > 0 and last_corners is not None:
            # Vẽ khung xanh bảo vệ quanh mã
            cv2.polylines(frame, [last_corners], True, (0, 255, 0), 4)
            # Ghi thông tin mục tiêu
            cv2.putText(frame, f"TARGET: {last_id_text}", (10, 80), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
            persistence_counter -= 1

        # Hiển thị FPS và Trạng thái LED (To hơn)
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.rectangle(frame, (600, 10), (630, 40), status_color, -1) 

        # Show preview
        cv2.imshow('Antigravyti - The Observer', frame)

        # Key to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("⏹️ Stopping Vision AI...")
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_vision()
