#!/usr/bin/env pybricks-micropython
from pybricks.hubs import EV3Brick
from pybricks.ev3devices import Motor, ColorSensor, UltrasonicSensor, GyroSensor, TouchSensor
from pybricks.parameters import Port, Stop
from pybricks.robotics import DriveBase
from umqtt.robust import MQTTClient
import time
import json

# --- KHỞI TẠO CƠ BẢN ---
ev3 = EV3Brick()
motors = {}
sensors = {}
robot = None

# --- CẤU HÌNH CLOUD (Để lấy IP động) ---
SB_URL = "https://dwvcscwhrlbtlawxarqc.supabase.co"
SB_KEY = "sb_publishable_AgzdmjQRng0okfomuCCKZQ_joAdBSsk"

# Cấu hình MQTT
MQTT_BROKER = "192.168.0.137" # Fallback IP
CLIENT_ID = "ev3_heritage_keeper"
TOPIC_CMD = "wro/robot/commands"
TOPIC_CFG = "wro/robot/config"

def get_hub_ip_from_supabase():
    """Truy vấn Supabase REST API để lấy Hub IP mới nhất từ Dashboard"""
    import urequests as requests
    url = "{}/rest/v1/robot_profiles?select=hub_ip&is_active=eq.true&limit=1".format(SB_URL)
    headers = {
        "apikey": SB_KEY,
        "Authorization": "Bearer {}".format(SB_KEY)
    }
    
    ev3.screen.print("Cloud Sync...")
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        response.close()
        
        if data and len(data) > 0:
            ip = data[0].get("hub_ip")
            if ip:
                print("✅ Found Hub IP: {}".format(ip))
                return ip
    except Exception as e:
        print("⚠️ Cloud Sync Failed: {}".format(e))
    
    print("⚠️ Using Fallback IP: {}".format(MQTT_BROKER))
    return MQTT_BROKER

def get_port(port_name):
    """Chuyển chuỗi 'outA' hoặc 'in1' thành đối tượng Port"""
    mapping = {
        "outA": Port.A, "outB": Port.B, "outC": Port.C, "outD": Port.D,
        "in1": Port.S1, "in2": Port.S2, "in3": Port.S3, "in4": Port.S4
    }
    return mapping.get(port_name)

def init_hardware(config):
    """Khởi tạo lại phần cứng dựa trên cấu hình nhận được"""
    global motors, sensors, robot
    
    # Dừng mọi hoạt động hiện tại trước khi khởi tạo mới
    try:
        if robot: robot.stop()
        for m in motors.values():
            try: m.stop()
            except: pass
        time.sleep(0.5) # Đợi phần cứng ổn định
    except:
        pass

    # Thử khởi tạo tối đa 3 lần nếu gặp lỗi EPERM
    for attempt in range(3):
        try:
            ev3.screen.clear()
            ev3.screen.print("Initializing...")
            
            m_ports = config.get("motor_ports", {})
            l_port = m_ports.get('left', 'outB')
            r_port = m_ports.get('right', 'outC')
            
            # Kiểm tra xung đột cổng
            if l_port == r_port:
                print("❌ Lỗi: Cổng Motor Trái và Phải đang trùng nhau ({})!".format(l_port))
                ev3.screen.print("Port Conflict!")
                return

            # 1. Khởi tạo Motors
            new_motors = {}
            new_motors['left'] = Motor(get_port(l_port))
            new_motors['right'] = Motor(get_port(r_port))
            
            if m_ports.get('aux1'):
                new_motors['aux1'] = Motor(get_port(m_ports.get('aux1')))
            if m_ports.get('aux2'):
                new_motors['aux2'] = Motor(get_port(m_ports.get('aux2')))

            # 2. Khởi tạo Sensors
            new_sensors = {}
            s_config = config.get("sensor_config", {})
            for port_name in ["in1", "in2", "in3", "in4"]:
                s_port = get_port(port_name)
                cfg = s_config.get(port_name)
                if not cfg or cfg.get('type') == 'none':
                    continue
                    
                s_type = cfg.get('type')
                try:
                    if s_type == 'color':
                        s_obj = ColorSensor(s_port)
                        new_sensors[port_name] = {"obj": s_obj, "type": "color", "mode": cfg.get('mode', 'color')}
                    elif s_type == 'ultrasonic':
                        new_sensors[port_name] = {"obj": UltrasonicSensor(s_port), "type": "ultrasonic"}
                    elif s_type == 'gyro':
                        new_sensors[port_name] = {"obj": GyroSensor(s_port), "type": "gyro"}
                    elif s_type == 'touch':
                        new_sensors[port_name] = {"obj": TouchSensor(s_port), "type": "touch"}
                    
                    print("📡 Port {}: Initialized {}".format(port_name, s_type))
                except Exception as e:
                    print("⚠️ Port {}: Failed to init {} - {}".format(port_name, s_type, e))

            # 3. Khởi tạo DriveBase
            new_robot = DriveBase(new_motors['left'], new_motors['right'], wheel_diameter=56, axle_track=114)
            new_robot.settings(600, 4000, 300, 12000)
            
            # Cập nhật biến toàn cục sau khi khởi tạo thành công
            motors = new_motors
            sensors = new_sensors
            robot = new_robot
            
            ev3.screen.print("✅ HW Ready")
            print("🤖 Robot Profile: {}".format(config.get('name', 'Unknown')))
            return # Thành công!
            
        except Exception as e:
            print("Init Attempt {} Failed: {}".format(attempt + 1, e))
            time.sleep(0.5)
            if attempt == 2:
                ev3.screen.print("❌ HW Error")

# Biến tránh spam lệnh
last_payload = ""

def stop_robot():
    """Dừng robot ngay lập tức (Hard Brake) - Tối ưu tốc độ phản hồi"""
    global robot, motors, last_payload
    last_payload = "" 
    try:
        if robot:
            robot.stop()
        # Khóa bánh ngay lập tức không chờ đợi
        if 'left' in motors:
            try: motors['left'].hold()
            except: pass
        if 'right' in motors:
            try: motors['right'].hold()
            except: pass
    except:
        pass

def on_message(topic, msg):
    global robot, motors, last_payload
    try:
        topic_str = topic.decode("utf-8")
        payload = msg.decode("utf-8")
        
        # Chặn lệnh lặp lại quá nhanh (Spam)
        if payload == last_payload:
            return
        last_payload = payload
        
        if topic_str == TOPIC_CFG:
            # Nhận cấu hình mới
            config = json.loads(payload)
            init_hardware(config)
            
        elif topic_str == TOPIC_CMD:
            # print("📩 CMD:", payload) # Uncomment nếu cần debug lệnh
            parts = payload.split(":")
            action = parts[0]
            
            if action == "move" and robot:
                direction = parts[1]
                speed_pct = int(parts[2])
                
                # Tỉ lệ quy đổi: 100% = 600 mm/s (tốc độ chạy thẳng nhanh hơn)
                linear_speed = (speed_pct / 100.0) * 600
                # Tỉ lệ quy đổi: 100% = 300 deg/s (tốc độ xoay nhanh hơn)
                angular_speed = (speed_pct / 100.0) * 300

                if direction == "forward": robot.drive(linear_speed, 0)
                elif direction == "backward": robot.drive(-linear_speed, 0)
                elif direction == "left": robot.drive(0, -angular_speed)
                elif direction == "right": robot.drive(0, angular_speed)
                elif direction == "stop": stop_robot()
                
            elif action == "aux_move":
                port_key = parts[1]
                value = float(parts[2])
                unit = parts[3]
                
                if port_key in motors:
                    motor = motors[port_key]
                    angle = value * 360 if unit == "rotations" else value
                    # Sử dụng wait=False để không làm treo vòng lặp xử lý lệnh
                    # Điều này cho phép robot vừa chạy bánh xe vừa quay arm
                    # default 'then' is Stop.HOLD
                    motor.run_angle(500, angle, wait=False)
                        
            elif action == "stop":
                stop_robot()
                
            elif action == "emergency":
                stop_robot()
                # Dừng tất cả motor khác
                for m in motors.values():
                    try: m.hold()
                    except: pass
                print("🆘 EMERGENCY STOP")

    except Exception as e:
        print("Msg Error:", e)

def run():
    global MQTT_BROKER
    
    # 1. Lấy IP động từ Supabase Dashboard
    MQTT_BROKER = get_hub_ip_from_supabase()
    
    ev3.screen.clear()
    ev3.screen.print("Broker: {}".format(MQTT_BROKER))
    ev3.screen.print("📡 Connecting...")
    
    try:
        client = MQTTClient(CLIENT_ID, MQTT_BROKER)
        client.set_callback(on_message)
        client.connect()
        client.subscribe(TOPIC_CMD)
        client.subscribe(TOPIC_CFG)
        ev3.screen.clear()
        ev3.screen.print("🚀 Waiting for CFG")
        
        while True:
            client.check_msg()
            # Loop nhanh gấn 10 lần để không bỏ lỡ lệnh
            time.sleep(0.005)
            
    except Exception as e:
        ev3.screen.print("❌ Fail")
        print("Run Error:", e)

if __name__ == "__main__":
    run()
