import os
import time
import json
import asyncio
import socket
import websockets
import paho.mqtt.client as mqtt
from db_client import db
from dotenv import load_dotenv
from threading import Thread
import traceback
from gemini_service import gemini_service

# Load env
load_dotenv()

# --- Config ---
MQTT_BROKER = "localhost" 
MQTT_PORT = 1883
MQTT_TOPIC_TELEMETRY = "robot/+/telemetry"
MQTT_TOPIC_STATUS = "robot/+/status"
MQTT_TOPIC_CFG = "robot/config"
WS_PORT = 8765
DEFAULT_MOBILE_ROBOT = "mobile_guide"

# Global Telemetry State
current_telemetry = {
    "battery": 100,
    "pos": {"x": 0, "y": 0},
    "latency": 0
}

def get_local_ip():
    """Tự động phát hiện địa chỉ IP của máy tính này trong mạng nội bộ"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Không cần kết nối thực sự, chỉ để lấy IP interface
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

# Init MQTT
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print(f"✅ Connected to MQTT Broker")
        client.subscribe(MQTT_TOPIC_TELEMETRY)
        client.subscribe(MQTT_TOPIC_STATUS)
        send_current_config()
    else:
        print(f"❌ MQTT Connect Failed: {reason_code}")

def on_message(client, userdata, msg):
    global current_telemetry
    try:
        topic = msg.topic
        payload_str = msg.payload.decode()
        data = json.loads(payload_str)
        
        if "telemetry" in topic:
            current_telemetry.update(data)
        elif "status" in topic:
            target_id = topic.split('/')[1]
            print(f"🔔 Status from [{target_id}]: {data}")
            # Broadcast to web dashboard
            asyncio.run_coroutine_threadsafe(
                broadcast_event({
                    "type": "station_status",
                    "station_id": target_id,
                    "status": data.get("status"),
                    "action": data.get("action")
                }), 
                asyncio.get_event_loop()
            )
    except Exception as e:
        print(f"⚠️ MQTT Msg Error [{msg.topic}]: {e}")

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

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

def publish_to_robot(target_id, message):
    """Gửi lệnh tới một robot hoặc trạm cụ thể qua MQTT"""
    topic = f"robot/{target_id}/command"
    payload = json.dumps(message) if isinstance(message, dict) else message
    mqtt_client.publish(topic, payload)
    print(f"📡 MQTT [OUT] -> {topic}: {payload}")

def execute_mqtt(mqtt_msg, target_id=DEFAULT_MOBILE_ROBOT):
    """Hàm tương thích ngược, mặc định gửi tới mobile robot"""
    publish_to_robot(target_id, mqtt_msg)

# --- WebSocket Server (High Speed Bridge) ---
connected_clients = set()

async def broadcast_telemetry():
    print("📡 Telemetry Broadcaster Started")
    global current_telemetry
    while True:
        if connected_clients:
            telemetry = json.dumps({
                "type": "telemetry",
                "battery": current_telemetry["battery"],
                "pos": current_telemetry["pos"],
                "latency": current_telemetry["latency"]
            })
            
            # Broadcast to all
            disconnected = set()
            active_clients = list(connected_clients) # Snapshot
            for ws in active_clients:
                try:
                    await ws.send(telemetry)
                except Exception as e:
                    disconnected.add(ws)
            
            for ws in disconnected:
                connected_clients.discard(ws)
                
        await asyncio.sleep(1.0) # Send every 1s

async def broadcast_event(data):
    """Gửi một sự kiện tới tất cả các client đang kết nối WebSocket"""
    if not connected_clients:
        return
    message = json.dumps(data)
    for client in connected_clients.copy():
        try:
            await client.send(message)
        except:
            connected_clients.discard(client)

async def ws_handler(websocket):
    print(f"🔗 Client Connected: {websocket.remote_address}")
    connected_clients.add(websocket)
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
                elif cmd == "site_discovered":
                    # Broadcast the site discovery event to all clients (Quiz & Map)
                    site_id = params.get('site_id')
                    site_name = params.get('site_name', site_id)
                    lang = params.get('lang', 'vi-VN')
                    
                    print(f"📍 Station Discovered: {site_id}")
                    await broadcast_event({
                        "type": "event",
                        "event": "site_discovered",
                        "station_id": site_id,
                        "site_name": site_name
                    })
                    
                    # 💡 Trigger Automated AI Storytelling
                    ai_data = await gemini_service.get_response(f"Describe the heritage site: {site_name}", lang)
                    if ai_data and ai_data.get("text"):
                        await broadcast_event({
                            "type": "voice_response",
                            "text": ai_data["text"]
                        })
                    
                    # 🤖 TRIGGER STATION ACTION (Phase 7 Orchestration)
                    # Giả sử tên trạm phần cứng trùng với site_id
                    publish_to_robot(site_id, {"action": "perform_intro"})
                        
                    mqtt_msg = "stop" # Auto-stop robot when site discovered
                elif cmd == "voice_command":
                    text = params.get('text', '').lower()
                    lang = params.get('lang', 'vi-VN')
                    print(f"🎙️ Voice Cmd [{lang}]: {text}")
                    
                    # 1. HARD KEYWORDS (Priority/Safety - Bypass AI)
                    if any(kw in text for kw in ["dừng", "đứng lại", "stop", "halt", "emergency", "cấp cứu"]):
                        execute_mqtt("stop")
                        await broadcast_event({
                            "type": "voice_response",
                            "text": "Đã dừng robot khẩn cấp." if "vi" in lang else "Emergency stop executed."
                        })
                    
                    # 2. SMART AI ROUTING (Gemini)
                    else:
                        ai_data = await gemini_service.get_response(text, lang)
                        if ai_data:
                            response_text = ai_data.get("text", "")
                            move_intent = ai_data.get("robot_move")
                            
                            # Execute move if intent found
                            if move_intent in ["forward", "backward", "stop"]:
                                # Map backward to backward, etc.
                                direction = "forward" if move_intent == "forward" else "backward" if move_intent == "backward" else "stop"
                                execute_mqtt(f"move:{direction}:100")
                            
                            # Broadcast text response for Tablet TTS
                            if response_text:
                                await broadcast_event({
                                    "type": "voice_response",
                                    "text": response_text
                                })
                                
                    continue # Voice command handles its own MQTT/Response
                
                elif cmd == "set_emotion":
                    # Broadcast emotion command to all clients (Robot Face)
                    emotion = params.get('emotion', 'neutral')
                    print(f"🎭 Setting Emotion: {emotion}")
                    await broadcast_event({
                        "type": "set_emotion",
                        "command": "set_emotion",
                        "emotion": emotion
                    })
                    
                execute_mqtt(mqtt_msg)
            except Exception as e:
                print(f"⚠️ WS Msg Error: {e}")
                traceback.print_exc()
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        if websocket in connected_clients:
            connected_clients.discard(websocket)
        print(f"🔌 Client Disconnected: {websocket.remote_address}")

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
    local_ip = get_local_ip()
    print("\n" + "="*50)
    print(f"📢  AI BRAIN HUB IS STARTING")
    print(f"🌐  Local IP Address: {local_ip}")
    print(f"🔗  Web Dashboard Hub IP: {local_ip}")
    print("="*50 + "\n")
    
    # Auto-update Hub IP in Supabase for active profile
    try:
        db.table("robot_profiles").update({"hub_ip": local_ip}).eq("is_active", True).execute()
        print(f"📡  Supabase: Hub IP synced to {local_ip} (Zero-Config Active)")
    except Exception as e:
        print(f"⚠️  Supabase Sync Failed: {e}")
    
    # Chạy song song WebSocketBroadcaster, WS Server và Supabase Polling
    await asyncio.gather(
        start_ws(),
        supabase_poll(),
        broadcast_telemetry()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        mqtt_client.loop_stop()
        print("👋 Shutdown")

