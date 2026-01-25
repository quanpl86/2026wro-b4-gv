# 🏛️ Antigravyti: Cấu Trúc Tổng Quan Dự Án

Bản vẽ kiến trúc cấp cao thể hiện sự kết nối giữa các tầng công nghệ trong hệ sinh thái **The Heritage Keeper**.

```mermaid
graph TD
    %% Tầng Người dùng & Giao diện
    subgraph UI_Layer ["Tầng Giao Diện (Tablet/Web)"]
        Storyteller["Next.js App (Storyteller)"]
        style UI_Layer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    end

    %% Tầng Đám mây & Dữ liệu
    subgraph Cloud_Layer ["Tầng Trung Tâm (Dữ Liệu & Realtime)"]
        Supabase[("Supabase (PostgreSQL + Realtime)")]
        MQTT_Broker["MQTT Broker (Local/Cloud)"]
        style Cloud_Layer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    end

    %% Tầng Trí tuệ bộ não
    subgraph AI_Brain_Layer ["Tầng AI Brain (Laptop)"]
        Commander["AI Commander (Python Engine)"]
        Observer["Observer (Computer Vision)"]
        Listener["Listener (Voice STT)"]
        style AI_Brain_Layer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    end

    %% Tầng Thực thi Vật lý
    subgraph Hardware_Layer ["Tầng Phần Cứng (Physical)"]
        EV3_Robot["Robot EV3 (Điều hướng)"]
        EV3_Station["EV3 Sa bàn (Cơ cấu trạm)"]
        ESP32["ESP32 (Hiệu ứng LED)"]
        style Hardware_Layer fill:#f1f8e9,stroke:#1b5e20,stroke-width:2px
    end

    %% Các mối quan hệ (Connections)
    Observer -- "Nhận diện mô hình" --> Commander
    Listener -- "Nhận diện khẩu lệnh" --> Commander
    Commander -- "Đồng bộ trạng thái" --> Supabase
    Supabase -- "Cập nhật trực quan" --> Storyteller
    Storyteller -- "Lệnh điều khiển" --> Supabase
    Supabase -- "Đẩy lệnh" --> Commander
    Commander -- "Gửi lệnh thực thi" --> MQTT_Broker
    MQTT_Broker -- "Giao thức MQTT" --> EV3_Robot
    MQTT_Broker -- "Giao thức MQTT" --> EV3_Station
    MQTT_Broker -- "Giao thức MQTT" --> ESP32

    %% Chú thích
    classDef brain fill:#ffcc80,stroke:#ef6c00;
    class Commander,Observer,Listener brain;
```

## 📐 Giải thích các tầng (Layers Explanation)

1.  **UI Layer (Next.js):** Nơi hiển thị thông tin Di sản, bản đồ thực tế và giao diện để giám khảo tương tác (Quiz, Điều khiển thủ công).
2.  **Cloud Layer (Supabase/MQTT):** Xương sống dữ liệu. Supabase giữ các dữ liệu quan trọng như trạng thái và hàng đợi lệnh. MQTT truyền tải các lệnh phần cứng cực nhanh.
3.  **AI Brain Layer (Python):** Trung tâm xử lý. Nơi "nhìn" (Observer) và "nghe" (Listener) dữ liệu từ thế giới thực, sau đó ra quyết định (Commander).
4.  **Hardware Layer (EV3/ESP32):** Các robot và thiết bị vật lý thực hiện các cử động và hiệu ứng ánh sáng trên sa bàn.

Tất cả các thành phần này phối hợp để biến bảo tàng thành một không gian tương tác thông minh.
