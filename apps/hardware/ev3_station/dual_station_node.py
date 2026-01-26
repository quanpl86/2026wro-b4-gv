#!/usr/bin/env python3
import time
import json
import paho.mqtt.client as mqtt
from ev3dev2.motor import LargeMotor, OUTPUT_A, OUTPUT_B
from ev3dev2.sound import Sound
from ev3dev2.led import Leds

# --- CONFIGURATION ---
# Load config.json to key "stations_config"
# Example config.json structure needed:
# {
#   "mqtt_broker_ip": "192.168.2.1",
#   "motor_a_station_id": "trang_an",
#   "motor_b_station_id": "hoi_an"
# }

try:
    with open('config.json', 'r') as f:
        config = json.load(f)
        BROKER = config.get('mqtt_broker_ip', '192.168.2.1')
        STATION_1_ID = config.get('motor_a_station_id', 'station_1')
        STATION_2_ID = config.get('motor_b_station_id', 'station_2')
except:
    print("Config file not found or invalid! Using defaults.")
    BROKER = '192.168.2.1'
    STATION_1_ID = 'demo_1'
    STATION_2_ID = 'demo_2'

# Topics
TOPIC_STATION_1_CMD = f"robot/{STATION_1_ID}/command"
TOPIC_STATION_2_CMD = f"robot/{STATION_2_ID}/command"
TOPIC_STATUS = "robot/station_controller/status"

# --- HARDWARE SETUP ---
sound = Sound()
leds = Leds()

# Initialize all 4 motors safely
motors = {}
try:
    motors['A'] = LargeMotor(OUTPUT_A)
    motors['B'] = LargeMotor(OUTPUT_B) # Assume Large for consistency, change to Medium if needed
    motors['C'] = LargeMotor(OUTPUT_C)
    motors['D'] = LargeMotor(OUTPUT_D)
    print("All 4 Motors Initialized.")
except Exception as e:
    print(f"Warning: Motor initialization failed: {e}")

# --- MQTT HANDLERS ---
def on_connect(client, userdata, flags, rc):
    print(f"Connected to Hub with code {rc}")
    client.subscribe(TOPIC_STATION_1_CMD)
    client.subscribe(TOPIC_STATION_2_CMD)
    
    # Announce
    client.publish(TOPIC_STATUS, json.dumps({
        "status": "online", 
        "controller": "dual_ev3",
        "managing": [STATION_1_ID, STATION_2_ID]
    }))
    sound.beep()

def on_message(client, userdata, msg):
    topic = msg.topic
    try:
        payload = json.loads(msg.payload.decode())
        print(f"[{topic}] Cmd: {payload}")
        
        if topic == TOPIC_STATION_1_CMD:
            perform_action(1, payload)
        elif topic == TOPIC_STATION_2_CMD:
            perform_action(2, payload)
            
    except Exception as e:
        print(f"Error: {e}")

def perform_action(station_num, data):
    action = data.get("action")
    leds.set_color("LEFT", "AMBER")
    
    if station_num == 1:
        print(f"Activating Station 1 ({STATION_1_ID}) -> Motors A & B")
        # Example Logic for Station 1 (Uses Port A & B)
        # Customize this based on specific station mechanics
        if action == "open_gate":
            if 'A' in motors: motors['A'].on_for_degrees(30, 90)
            if 'B' in motors: motors['B'].on_for_degrees(50, 180) 
            
    else:
        print(f"Activating Station 2 ({STATION_2_ID}) -> Motors C & D")
        # Example Logic for Station 2 (Uses Port C & D)
        if action == "raise_flag":
             if 'C' in motors: motors['C'].on_for_degrees(30, 90)
             if 'D' in motors: motors['D'].on_for_degrees(50, 360)

    # Finish
    leds.set_color("LEFT", "GREEN")
    client.publish(f"robot/{STATION_1_ID if station_num == 1 else STATION_2_ID}/status", 
                   json.dumps({"status": "finished", "action": action}))

# --- MAIN ---
client = mqtt.Client(client_id="ev3_dual_controller")
client.on_connect = on_connect
client.on_message = on_message

print("--- STATION CONTROLLER (DUAL MODE) ---")
print(f"Listening for: {STATION_1_ID} & {STATION_2_ID}")

while True:
    try:
        client.connect(BROKER, 1883, 60)
        client.loop_forever()
    except:
        print("Reconnecting to Hub...")
        time.sleep(5)
