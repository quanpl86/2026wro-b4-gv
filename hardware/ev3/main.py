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

# Cấu hình MQTT
MQTT_BROKER = "192.168.0.137" # Sẽ được cập nhật từ dashboard
CLIENT_ID = "ev3_heritage_keeper"
TOPIC_CMD = "wro/robot/commands"
TOPIC_CFG = "wro/robot/config"

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
        motors = {}
        motors['left'] = Motor(get_port(l_port))
        motors['right'] = Motor(get_port(r_port))
        
        if m_ports.get('aux1'):
            motors['aux1'] = Motor(get_port(m_ports.get('aux1')))
        if m_ports.get('aux2'):
            motors['aux2'] = Motor(get_port(m_ports.get('aux2')))

        # 2. Khởi tạo Sensors
        sensors = {}
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
                    # Mode will be handled during reading or via specific logic if needed
                    # Pybricks ColorSensor modes are accessed via methods like .color(), .reflection(), .ambient()
                    sensors[port_name] = {"obj": s_obj, "type": "color", "mode": cfg.get('mode', 'color')}
                elif s_type == 'ultrasonic':
                    sensors[port_name] = {"obj": UltrasonicSensor(s_port), "type": "ultrasonic"}
                elif s_type == 'gyro':
                    sensors[port_name] = {"obj": GyroSensor(s_port), "type": "gyro"}
                elif s_type == 'touch':
                    sensors[port_name] = {"obj": TouchSensor(s_port), "type": "touch"}
                
                print("📡 Port {}: Initialized {}".format(port_name, s_type))
            except Exception as e:
                print("⚠️ Port {}: Failed to init {} - {}".format(port_name, s_type, e))

        # 3. Khởi tạo DriveBase
        robot = DriveBase(motors['left'], motors['right'], wheel_diameter=56, axle_track=114)
        
        # Tăng giới hạn tốc độ và gia tốc của DriveBase
        robot.settings(600, 600, 300, 300)
        
        ev3.screen.print("✅ HW Ready")
        print("🤖 Robot Profile: {}".format(config.get('name', 'Unknown')))
    except Exception as e:
        ev3.screen.print("❌ HW Error")
        print("Init Error:", e)

def on_message(topic, msg):
    global robot, motors
    try:
        topic_str = topic.decode("utf-8")
        payload = msg.decode("utf-8")
        
        if topic_str == TOPIC_CFG:
            # Nhận cấu hình mới
            config = json.loads(payload)
            init_hardware(config)
            
        elif topic_str == TOPIC_CMD:
            # Nhận lệnh điều khiển
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
                elif direction == "stop": robot.stop()
                
            elif action == "aux_move":
                port_key = parts[1]
                value = float(parts[2])
                unit = parts[3]
                
                if port_key in motors:
                    motor = motors[port_key]
                    angle = value * 360 if unit == "rotations" else value
                    # Sử dụng wait=False để không làm treo vòng lặp xử lý lệnh
                    # Điều này cho phép robot vừa chạy bánh xe vừa quay arm
                    motor.run_angle(500, angle, wait=False)
                        
            elif action == "stop":
                # Chỉ dừng bánh xe (DriveBase)
                if robot: robot.stop()
                
            elif action == "emergency":
                # Dừng TOÀN BỘ robot và các động cơ phụ
                if robot: robot.stop()
                for m in motors.values(): m.stop()

    except Exception as e:
        print("Msg Error:", e)

def run():
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
            time.sleep(0.05) # Độ trễ thấp
            
    except Exception as e:
        ev3.screen.print("❌ Fail")
        print("Run Error:", e)

if __name__ == "__main__":
    run()
