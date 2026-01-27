#!/usr/bin/env python3
import time
import json
import os
import paho.mqtt.client as mqtt
from ev3dev2.motor import LargeMotor, MediumMotor, OUTPUT_A, OUTPUT_B
from ev3dev2.sound import Sound
from ev3dev2.led import Leds

# --- CONFIGURATION ---
# Load from external config or default
try:
    with open('config.json', 'r') as f:
        config = json.load(f)
        BROKER = config.get('mqtt_broker_ip', '192.168.2.1') # Default Mac Bridge IP
        STATION_ID = config.get('station_id', 'station_test')
except:
    BROKER = '192.168.2.1'
    STATION_ID = 'station_demo'

TOPIC_COMMAND = f"robot/{STATION_ID}/command"
TOPIC_STATUS = f"robot/{STATION_ID}/status"

# --- HARDWARE SETUP ---
sound = Sound()
leds = Leds()
# motors can be initialized lazily or here if ports are fixed
# motor_a = LargeMotor(OUTPUT_A)

# --- MQTT HANDLERS ---
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC_COMMAND)
    # Announce online
    client.publish(TOPIC_STATUS, json.dumps({"status": "online", "station_id": STATION_ID}))
    leds.set_color("LEFT", "GREEN")
    leds.set_color("RIGHT", "GREEN")
    sound.beep()

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Received command: {payload}")
        process_command(payload)
    except Exception as e:
        print(f"Error processing message: {e}")

def process_command(cmd_data):
    action = cmd_data.get("action")
    
    # Indicate busy
    leds.set_color("LEFT", "AMBER")
    client.publish(TOPIC_STATUS, json.dumps({"status": "busy", "action": action}))

    if action == "perform_intro":
        sound.speak("Hello, welcome to Hidden Heritage")
    elif action == "open_gate":
        # Example motor logic
        # motor_a.on_for_degrees(30, 90)
        time.sleep(2) # Simulating action
    elif action == "beep":
        sound.beep()
    
    # Finished
    leds.set_color("LEFT", "GREEN")
    client.publish(TOPIC_STATUS, json.dumps({"status": "finished", "action": action}))

# --- MAIN LOOP ---
client = mqtt.Client(client_id=f"ev3_{STATION_ID}")
client.on_connect = on_connect
client.on_message = on_message

# Thiết lập Last Will
client.will_set(TOPIC_STATUS, json.dumps({"status": "offline", "station_id": STATION_ID}), retain=True)

print(f"Starting Station Node: {STATION_ID}")
print(f"Connecting to Broker: {BROKER}...")

while True:
    try:
        client.connect(BROKER, 1883, 60)
        # Báo cáo online
        client.publish(TOPIC_STATUS, json.dumps({"status": "online", "station_id": STATION_ID}), retain=True)
        client.loop_forever()
    except Exception as e:
        print(f"Connection failed: {e}. Retrying in 5s...")
        time.sleep(5)
