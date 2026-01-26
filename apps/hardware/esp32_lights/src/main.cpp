#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

// --- CONFIGURATION ---
const char *ssid = "WRO_WIFI";
const char *password = "password";         // Cập nhật pass wifi thật
const char *mqtt_server = "192.168.1.100"; // IP Mac Hub

// --- HARDWARE ---
// Định nghĩa chân LED (Sửa lại theo thực tế)
const int LED_1 = 12;
const int LED_2 = 13;
const int LED_3 = 14;
const int LED_4 = 27;

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi();
void callback(char *topic, byte *message, unsigned int length);
void reconnect();

void setup() {
  Serial.begin(115200);
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(LED_3, OUTPUT);
  pinMode(LED_4, OUTPUT);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char *topic, byte *message, unsigned int length) {
  Serial.print("Message waiting on topic: ");
  Serial.print(topic);

  String messageTemp;
  for (int i = 0; i < length; i++) {
    messageTemp += (char)message[i];
  }
  Serial.println();
  Serial.println("Payload: " + messageTemp);

  // --- LOGIC XỬ LÝ LỆNH ---
  // Ví dụ payload: {"led": 1, "state": "ON"}
  if (messageTemp.indexOf("ON") > 0) {
    digitalWrite(LED_1, HIGH);
  } else if (messageTemp.indexOf("OFF") > 0) {
    digitalWrite(LED_1, LOW);
  }
  // TODO: Thêm logic JSON parser xịn hơn (ArduinoJson) nếu cần
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32_Light_Node")) {
      Serial.println("connected");
      client.subscribe("robot/lights/command");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
