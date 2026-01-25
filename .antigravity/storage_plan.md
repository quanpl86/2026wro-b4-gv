# Antigravyti Storage Plan

This document outlines how data is persisted and communicated across the system.

## 1. Supabase (PostgreSQL) - Persistent & Real-time Data

### Table: `system_status`
- `id`: UUID (Primary Key)
- `current_station`: String (e.g., "trong_dong", "cot_co")
- `robot_action`: Enum (idle, moving, speaking)
- `battery`: Float
- `mode`: Enum (auto, manual)
- `updated_at`: Timestamp (Current Time)

### Table: `command_queue`
- `id`: BigInt (Auto Increment)
- `target_agent`: Enum (ev3, esp32)
- `action`: String (e.g., "move_forward", "led_blink")
- `payload`: JSONB
- `status`: Enum (pending, in_progress, done, failed)
- `created_at`: Timestamp

### Table: `quiz_data`
- `id`: Int (Primary Key)
- `station_id`: String
- `question`: Text
- `options`: JSONB (Array of choices)
- `correct_answer`: Int (Index)

## 2. MQTT (Internal Communication) - Low Latency

### Topic Structure
- `antigravyti/robot/move`: Movement commands for EV3.
- `antigravyti/env/led`: Lighting commands for ESP32.
- `antigravyti/brain/vision`: Detection results from Observer.
- `antigravyti/brain/voice`: Intents from Listener.

## 3. Local Configurations
- `packages/shared-config/config.json`: Master project settings.
- `.env`: API Keys (Supabase, MQTT Broker).
