# 🧠 Antigravyti: System Flow Mindmap

Tài liệu này mô tả luồng hoạt động tổng thể của hệ thống Phygital, từ cảm biến đến hành động.

```mermaid
mindmap
  root((Antigravyti System))
    Input_Layer
      Observer_Vision
        Object_Detection
        Station_Recognition
      Listener_Voice
        Speech_to_Text_Offline
        Intent_Classification
      Web_Interface
        Manual_Commands
        Admin_Override
    Logic_Layer_AI_Brain
      Commander_Engine
        State_Machine
        Decision_Matrix
        Realtime_Sync_Logic
      Supabase_Cloud
        System_Status
        Command_Queue
        Quiz_History
    Output_Layer
      Operator_Hardware
        EV3_Robot_Line_Follower
        EV3_Station_Actuators
        ESP32_NeoPixel_LEDs
      Storyteller_Web
        Dynamic_Media
        Interactive_Quiz
        Live_Telemetry
    Project_Management
      9_AI_Agents
      Master_Plan
      Project_Info_Sync
```

## 🚥 Luồng Dữ Liệu Chính (Data Pipeline)
1. **Sensors (Vision/Voice)** -> Phát hiện Sự kiện (Event).
2. **Commander** -> Xử lý Event & Cập nhật **Supabase**.
3. **Operator** -> Lắng nghe MQTT/Supabase & Điều khiển **Hardware**.
4. **Storyteller** -> Lắng nghe Supabase & Cập nhật **UI Tablet**.
