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
# Example: ID 0 -> Trang An -> Stop and maybe rotate aux motor
SITES = {
    0: {"name": "Tràng An", "action": "stop"},
    1: {"name": "Cột Cờ Kỳ Đài", "action": "stop"},
    2: {"name": "Chùa Một Cột", "action": "stop"}
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

    # ArUco Settings
    # Try different dictionary if needed (4x4_50 is standard)
    aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
    parameters = aruco.DetectorParameters()
    detector = aruco.ArucoDetector(aruco_dict, parameters)

    print("👁️ The Observer is watching...")
    
    last_detected_id = -1
    last_detection_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect ArUco markers
        corners, ids, rejected = detector.detectMarkers(gray)

        if ids is not None:
            # Draw markers
            aruco.drawDetectedMarkers(frame, corners, ids)
            
            for i in range(len(ids)):
                marker_id = int(ids[i][0])
                
                # Check if this is a known site
                if marker_id in SITES:
                    site = SITES[marker_id]
                    
                    # Prevent rapid re-triggering (debounce)
                    current_time = time.time()
                    if marker_id != last_detected_id or (current_time - last_detection_time > 5):
                        print(f"🚩 Spotted: {site['name']} (ID: {marker_id})")
                        
                        # Trigger Action
                        if site['action'] == "stop":
                            send_robot_command("stop")
                        
                        last_detected_id = marker_id
                        last_detection_time = current_time

                    # Visual feedback on frame
                    cv2.putText(frame, f"SITE: {site['name']}", (10, 50), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Show preview
        cv2.imshow('Antigravyti - The Observer', frame)

        # Key to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_vision()
