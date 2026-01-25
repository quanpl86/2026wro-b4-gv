import os
import time
import json
import asyncio
import websockets
import paho.mqtt.client as mqtt
from db_client import db
from dotenv import load_dotenv
from threading import Thread

# Load env
load_dotenv()

# --- Config ---
MQTT_BROKER = "localhost" 
MQTT_PORT = 1883
MQTT_TOPIC_CMD = "wro/robot/commands"
MQTT_TOPIC_CFG = "wro/robot/config"
WS_PORT = 8765

# Init MQTT
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print(f"✅ Connected to MQTT Broker")
        send_current_config()
    else:
        print(f"❌ MQTT Connect Failed: {reason_code}")

mqtt_client.on_connect = on_connect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
except Exception as e:
    print(f"⚠️ MQTT Offline: {e}")

def get_active_profile():
    try:
        response = db.table("robot_profiles").select("*").eq("is_active", True).single().execute()
        return response.data
    except:
        return None

def send_current_config():
    profile = get_active_profile()
    if profile:
        config_msg = json.dumps({
            "name": profile.get("name", "Robot"),
            "motor_ports": profile.get('motor_ports', {}),
            "sensor_config": profile.get('sensor_config', {}),
            "speeds": profile.get('speed_profile', {})
        })
        mqtt_client.publish(MQTT_TOPIC_CFG, config_msg, retain=True)
        print(f"⚙️ Sync Profile: {profile['name']}")

def execute_mqtt(mqtt_msg):
    mqtt_client.publish(MQTT_TOPIC_CMD, mqtt_msg)
    print(f"📡 MQTT [OUT]: {mqtt_msg}")

# --- WebSocket Server (High Speed Bridge) ---
async def ws_handler(websocket):
    print(f"🔗 Vision Client Connected")
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                cmd = data.get('command')
                params = data.get('params', {})
                
                # Biến đổi lệnh JSON thành chuỗi MQTT EV3
                mqtt_msg = f"{cmd}"
                if cmd == "move":
                    mqtt_msg = f"move:{params.get('direction', 'stop')}:{params.get('speed', 100)}"
                elif cmd == "aux_move":
                    mqtt_msg = f"aux_move:{params.get('port', 'aux1')}:{params.get('value', 0)}:{params.get('unit', 'rotations')}"
                
                execute_mqtt(mqtt_msg)
            except Exception as e:
                print(f"⚠️ WS Msg Error: {e}")
    except websockets.exceptions.ConnectionClosed:
        print("🔌 Vision Client Disconnected")

async def start_ws():
    print(f"🚀 High-Speed Bridge running on ws://0.0.0.0:{WS_PORT}")
    async with websockets.serve(ws_handler, "0.0.0.0", WS_PORT):
        await asyncio.Future() # Keep running

# --- Supabase Listener (Legacy/General) ---
async def supabase_poll():
    print("📋 Supabase Listener Active")
    last_config_check = 0
    while True:
        try:
            if time.time() - last_config_check > 10:
                send_current_config()
                last_config_check = time.time()

            response = db.table("command_queue").select("*").eq("status", "pending").eq("target", "ev3_robot").order("created_at").execute()
            pending_cmds = response.data
            
            if pending_cmds:
                if len(pending_cmds) > 5:
                    to_skip = pending_cmds[:-3]
                    for s in to_skip:
                        db.table("command_queue").update({"status": "skipped"}).eq("id", s['id']).execute()
                    pending_cmds = pending_cmds[-3:]

                for cmd in pending_cmds:
                    c = cmd['command']
                    p = cmd['params']
                    mqtt_msg = f"{c}"
                    if c == "move":
                        mqtt_msg = f"move:{p.get('direction', 'stop')}:{p.get('speed', 100)}"
                    elif c == "aux_move":
                        mqtt_msg = f"aux_move:{p.get('port', 'aux1')}:{p.get('value', 0)}:{p.get('unit', 'rotations')}"
                    
                    execute_mqtt(mqtt_msg)
                    db.table("command_queue").update({"status": "completed"}).eq("id", cmd['id']).execute()
            
            await asyncio.sleep(0.05)
        except Exception as e:
            print(f"⚠️ Supabase Error: {e}")
            await asyncio.sleep(1)

async def main():
    # Chạy song song WebSocket và Supabase Polling
    await asyncio.gather(
        start_ws(),
        supabase_poll()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        mqtt_client.loop_stop()
        print("👋 Shutdown")
