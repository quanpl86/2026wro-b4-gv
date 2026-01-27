#!/usr/bin/env python3
import time
import json
import paho.mqtt.client as mqtt
from ev3dev2.motor import LargeMotor, MediumMotor, OUTPUT_A, OUTPUT_B, OUTPUT_C, OUTPUT_D, MoveTank
from ev3dev2.sensor.lego import ColorSensor, UltrasonicSensor, GyroSensor
from ev3dev2.sound import Sound
from ev3dev2.led import Leds

# --- 🛠️ 1. CALIBRATION CONFIG (USER TO TUNE LATER) ---
# Tinh chỉnh các góc này sau khi lắp tay xong
ARM_LEFT_LIMIT_UP = 90    # Độ mở tối đa tay trái
ARM_LEFT_LIMIT_DOWN = 0   # Vị trí nghỉ tay trái
ARM_RIGHT_LIMIT_UP = 90   # Độ mở tối đa tay phải
ARM_RIGHT_LIMIT_DOWN = 0  # Vị trí nghỉ tay phải
SPEED_GESTURE = 30        # Tốc độ múa tay

# --- CONFIGURATION ---
BROKER = '192.168.2.1' # IP của Mac (Bluetooth PAN Gateway)
ROBOT_ID = 'mobile_guide'

# --- HARDWARE SETUP ---
sound = Sound()
leds = Leds()

print("Initializing Hardware...")
try:
    # Arms (Tay di chuyển - Emotion)
    motor_left_arm = MediumMotor(OUTPUT_A)  # Tay Trái
    motor_right_arm = MediumMotor(OUTPUT_D) # Tay Phải
    
    # Drive Base (Bánh xe - Di chuyển)
    tank_drive = MoveTank(OUTPUT_B, OUTPUT_C)
    
    # Sensors
    # color_left = ColorSensor(INPUT_1)
    # color_right = ColorSensor(INPUT_2)
    # ultrasonic = UltrasonicSensor(INPUT_3)
    # gyro = GyroSensor(INPUT_4)
    
    print("Hardware Ready!")
    sound.beep()
except Exception as e:
    print(f"⚠️ Warning: Hardware init failed: {e}")

# --- 🎭 2. EMOTION ENGINE (ANIMATIONS) ---
def perform_gesture(gesture_name):
    print(f"Adding Emotion: {gesture_name}")
    leds.set_color("LEFT", "AMBER")
    
    if gesture_name == "HELLO":
        # Vẫy tay chào: Cả 2 tay lên xuống nhịp nhàng
        sound.speak("Hello everyone")
        for _ in range(2):
            motor_left_arm.on_for_degrees(SPEED_GESTURE, 45, block=False)
            motor_right_arm.on_for_degrees(SPEED_GESTURE, 45, block=True)
            motor_left_arm.on_for_degrees(SPEED_GESTURE, -45, block=False)
            motor_right_arm.on_for_degrees(SPEED_GESTURE, -45, block=True)
            
    elif gesture_name == "POINT_LEFT":
        # Chỉ tay trái về phía trạm
        sound.speak("Look at this")
        motor_left_arm.on_for_degrees(SPEED_GESTURE, ARM_LEFT_LIMIT_UP)
        time.sleep(2)
        motor_left_arm.on_for_degrees(SPEED_GESTURE/2, -ARM_LEFT_LIMIT_UP)
        
    elif gesture_name == "HAPPY":
        # Vung tay ăn mừng
        sound.play_song((('C4', 'q'), ('D4', 'q'), ('E4', 'q')))
        motor_left_arm.on_for_degrees(50, 90, block=False)
        motor_right_arm.on_for_degrees(50, 90, block=True)
        time.sleep(0.5)
        motor_left_arm.on_for_degrees(30, -90, block=False)
        motor_right_arm.on_for_degrees(30, -90, block=True)
        
    leds.set_color("LEFT", "GREEN")

# --- MQTT HANDLERS ---
def on_connect(client, userdata, flags, rc):
    print(f"Connected (RC={rc})")
    client.subscribe(f"robot/{ROBOT_ID}/command") # Lắng nghe lệnh di chuyển
    client.subscribe(f"robot/{ROBOT_ID}/emotion") # Lắng nghe lệnh cảm xúc

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        topic = msg.topic
        
        if "emotion" in topic:
            perform_gesture(payload.get("type", "HAPPY"))
        elif "command" in topic:
            # Xử lý lệnh di chuyển (sẽ code sau)
            pass
            
    except Exception as e:
        print(f"Msg Error: {e}")

# --- MAIN LOOP ---
client = mqtt.Client(client_id=ROBOT_ID)
client.on_connect = on_connect
client.on_message = on_message

# Thiết lập Last Will (Nếu robot mất kết nối đột ngột, Hub sẽ nhận được tin này)
client.will_set(f"robot/{ROBOT_ID}/status", json.dumps({"status": "offline"}), retain=True)

print(f"🤖 MOBILE GUIDE PREPARED. Waiting for Broker: {BROKER}")
while True:
    try:
        client.connect(BROKER, 1883, 60)
        # Báo cáo trạng thái online ngay khi kết nối
        client.publish(f"robot/{ROBOT_ID}/status", json.dumps({"status": "online"}), retain=True)
        client.loop_forever()
    except:
        time.sleep(5)
