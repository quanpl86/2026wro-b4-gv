# 🏛️ Antigravyti: Kiến Trúc Hệ Thống Phân Tán (Distributed System)

Hệ thống **The Heritage Keeper** được thiết kế để hoạt động đa thiết bị, phối hợp nhịp nhàng giữa Robot, Điện thoại, Máy tính bảng và Hub trung tâm.

```mermaid
graph TD
    %% Tầng Cảm biến (Robot Eyes)
    subgraph Eyes_Unit ["📱 Robot Eyes (Smartphone trên Robot)"]
        VisionAI["Web Vision Mode (ArUco Detection)"]
        CamStream["Camera Stream (Live View)"]
    end

    %% Tầng Tương tác (Judge Portal)
    subgraph Portal_Unit ["📑 Judge Portal (Tablet / iPad)"]
        InteractUI["Next.js App (Interactive UI)"]
        MiniGames["Mini Games (Di sản)"]
        AIAssistant["Chat AI Assistant (Voice)"]
    end

    %% Tầng Hub Trung tâm (Central Hub)
    subgraph Hub_Unit ["💻 Central Hub (Laptop / RPi)"]
        MQTT_Broker["MQTT Broker (Central Hub)"]
        AIEngine["AI Processing Hub (LLM)"]
    end

    %% Tầng Thực thi (Physical Robots)
    subgraph Hardware_Layer ["🤖 Hardware Layer (Physical)"]
        EV3_Robot["Robot Di động (Main Bot)"]
        EV3_Stations["Mô hình tĩnh (Static Models)"]
        ESP32_Effects["LED Effects (ESP32)"]
    end

    %% Luồng dữ liệu
    VisionAI -- "Tín hiệu Nhận diện (MQTT)" --> MQTT_Broker
    InteractUI -- "Lệnh tương tác" --> MQTT_Broker
    MQTT_Broker -- "Điều khiển cử động" --> EV3_Robot
    MQTT_Broker -- "Kích hoạt hiệu ứng" --> EV3_Stations
    MQTT_Broker -- "Trạng thái Realtime" --> InteractUI
    CamStream -. "Video (WebRTC/Nami)" .-> InteractUI
    AIEngine <--> InteractUI
```

## 📐 Phân vai các thiết bị (Device Roles)

### 1. 📱 Robot Eyes (Smartphone gắn trên lưng Robot)
- **Nhiệm vụ:** Là "đôi mắt" của Robot.
- **Tính năng:** Chỉ chạy chế độ **Vision Mode**. Liên tục quét ArUco markers để tìm Di sản. Khi thấy mã, nó bắn trực tiếp lệnh điều khiển Robot qua MQTT. Ngoài ra, nó có thể stream video về máy tính bảng.

### 2. 📑 Judge Portal (Máy tính bảng cho Ban giám khảo)
- **Nhiệm vụ:** Là cửa ngõ trải nghiệm.
- **Tính năng:** 
    - Hiển thị video trực tiếp từ điện thoại Robot.
    - Chạy các **Mini-games** tương tác tại mỗi điểm dừng.
    - Tích hợp **AI Assistant** để trò chuyện và tra cứu thông tin di sản.

### 3. 💻 Central Hub (Laptop hoặc Raspberry Pi)
- **Nhiệm vụ:** Là "Hệ điều hành" trung tâm.
- **Tính năng:** 
    - Chạy **MQTT Broker** để tất cả các thiết bị "nói chuyện" với nhau.
    - Kết nối và kiểm soát đồng thời Robot di động và các trạm mô hình tĩnh trên sa bàn.
    - Chạy các model AI nặng (nếu trình duyệt không gánh nổi).

## 🚀 Lợi ích của mô hình này:
- **Tính độc lập:** Điện thoại chỉ tập trung "nhìn", Máy tính bảng chỉ tập trung "chơi". Không thiết bị nào bị quá tải.
- **Tính chuyên nghiệp:** Giám khảo có thể đứng xa sa bàn, cầm iPad để tương tác mà không làm ảnh hưởng đến hành trình của Robot.
- **Tính linh hoạt:** Có thể dễ dàng thêm nhiều Robot hoặc thiết bị IoT khác vào Hub trung tâm.
