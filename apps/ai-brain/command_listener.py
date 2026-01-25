import os
import time
import json
import paho.mqtt.client as mqtt
from db_client import db
from dotenv import load_dotenv

# Load env
load_dotenv()

# --- Cấu hình MQTT ---
MQTT_BROKER = "localhost" 
MQTT_PORT = 1883
MQTT_TOPIC_CMD = "wro/robot/commands"
MQTT_TOPIC_CFG = "wro/robot/config"

# Khởi tạo MQTT Client
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print(f"✅ Đã kết nối MQTT Broker")
        # Gửi cấu hình ngay khi kết nối
        send_current_config()
    else:
        print(f"❌ Lỗi kết nối MQTT: {reason_code}")

mqtt_client.on_connect = on_connect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
except Exception as e:
    print(f"⚠️ MQTT Offline: {e}")

def get_active_profile():
    """Lấy cấu hình robot đang hoạt động"""
    try:
        response = db.table("robot_profiles").select("*").eq("is_active", True).single().execute()
        return response.data
    except:
        return None

def send_current_config():
    """Gửi cấu hình port và speed hiện tại xuống robot"""
    profile = get_active_profile()
    if profile:
        config_msg = json.dumps({
            "name": profile.get("name", "Robot"),
            "motor_ports": profile.get('motor_ports', {}),
            "sensor_config": profile.get('sensor_config', {}),
            "speeds": profile.get('speed_profile', {})
        })
        mqtt_client.publish(MQTT_TOPIC_CFG, config_msg, retain=True)
        print(f"⚙️ Đã đồng bộ cấu hình Robot: {profile['name']}")

def process_command(cmd_id, target, command, params):
    print(f"\n🚀 [ADVANCED] LỆNH MỚI:")
    print(f"   - ID: {cmd_id} | CMD: {command}")
    
    mqtt_msg = f"{command}"
    
    if command == "move":
        # Sử dụng tốc độ từ params hoặc mặc định
        direction = params.get('direction', 'stop')
        speed = params.get('speed', 100)
        mqtt_msg = f"move:{direction}:{speed}"
        
    elif command == "aux_move":
        # Lệnh cho động cơ phụ: aux_move:port_key:value:unit
        port_key = params.get('port', 'aux1')
        value = params.get('value', 0)
        unit = params.get('unit', 'rotations')
        mqtt_msg = f"aux_move:{port_key}:{value}:{unit}"
        
    elif command == "stop":
        mqtt_msg = "stop"

    elif command == "emergency":
        mqtt_msg = "emergency"

    # Gửi lệnh
    mqtt_client.publish(MQTT_TOPIC_CMD, mqtt_msg)
    print(f"📡 Đã gửi MQTT: {mqtt_msg}")
    
    # Cập nhật hoàn thành
    db.table("command_queue").update({"status": "completed"}).eq("id", cmd_id).execute()
    print(f"✅ Xong lệnh {cmd_id}")

def listen_advanced():
    print("="*50)
    print("🔥 ANTIGRAVYTI AI BRAIN - ADVANCED CONTROL MODE")
    print("⚡ Hỗ trợ: Dynamic Config, Aux Motors, Precision Move")
    print("="*50)
    
    # Dọn dẹp hàng đợi cũ (lệnh lỗi thời)
    db.table("command_queue").update({"status": "skipped"}).eq("status", "pending").eq("target", "ev3_robot").execute()

    last_config_check = 0
    
    while True:
        try:
            # Tự động đồng bộ config mỗi 10 giây
            if time.time() - last_config_check > 10:
                send_current_config()
                last_config_check = time.time()

            # Lấy tất cả lệnh đang chờ (GIỮ LẠI THỨ TỰ THỜI GIAN)
            response = db.table("command_queue")\
                .select("*")\
                .eq("status", "pending")\
                .eq("target", "ev3_robot")\
                .order("created_at")\
                .execute()
            
            pending_cmds = response.data
            
            if pending_cmds:
                # Nếu có quá nhiều lệnh đang chờ (lag), chỉ giữ các lệnh gần đây nhất
                # Nhưng phải cẩn thận không bỏ lỡ lệnh 'stop' cuối cùng
                if len(pending_cmds) > 10:
                    print(f"⚠️ Phát hiện lag ({len(pending_cmds)} lệnh). Đang tối ưu...")
                    # Chỉ lấy 5 lệnh gần nhất
                    to_skip = pending_cmds[:-5]
                    to_process = pending_cmds[-5:]
                    
                    for cmd in to_skip:
                        db.table("command_queue").update({"status": "skipped"}).eq("id", cmd['id']).execute()
                    
                    pending_cmds = to_process

                for cmd in pending_cmds:
                    # Kiểm tra độ trễ (nếu lệnh được gửi quá 1.5 giây trước thì bỏ qua để an toàn)
                    # Giả định created_at là UTC. 
                    # parse created_at manually for simple comparison or assume it's fresh enough if pulled just now
                    # Để đơn giản và chính xác hơn cho robot, ta cứ xử lý theo thứ tự.
                    
                    process_command(cmd['id'], cmd['target'], cmd['command'], cmd['params'])
            
            # Tăng tần suất lấy lệnh (0.05s thay vì 0.1s) để mượt hơn
            time.sleep(0.05)
            
        except KeyboardInterrupt:
            print("\n👋 Đang tắt...")
            mqtt_client.loop_stop()
            break
        except Exception as e:
            print(f"⚠️ Lỗi: {e}")
            time.sleep(0.5)

if __name__ == "__main__":
    listen_advanced()
