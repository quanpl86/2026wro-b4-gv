# Runtime Agents Roles

These agents are functional modules running in parallel to operate the Phygital system.

## 4. AG-Run-04: The Observer (Thị giác)
- **Input:** Laptop Camera.
- **Logic:** Object recognition (Teachable Machine / OpenCV).
- **Output:** Detection events (e.g., `{"item": "TrongDong", "conf": 0.98}`) to Commander.

## 5. AG-Run-05: The Listener (Thính giác)
- **Input:** Microphone.
- **Logic:** STT (Vosk Offline), Keyword analysis.
- **Output:** Intents (e.g., `{"intent": "explain", "target": "curr_pos"}`) to Commander.

## 6. AG-Run-06: The Commander (Bộ não Logic)
- **Role:** Decision Engine.
- **Input:** Combined signals from Observer, Listener, and Web Web.
- **Output:** Coordinated commands to Operator and Storyteller.

## 7. AG-Run-07: The Operator (Phần cứng)
- **Role:** Hardware Driver.
- **Logic:** Controls EV3 motors and ESP32 LEDs via MQTT.
- **Protocols:** MQTT, ev3dev, Arduino.

## 8. AG-Run-08: The Storyteller (Giao diện Web)
- **Role:** Content Presenter.
- **Interface:** Next.js Client Components.
- **Duties:** Display culture content, Mini-games, Real-time status from Supabase.
