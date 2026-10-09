/**
 * JalLoop — ESP32 firmware (Wokwi + real hardware)
 *
 * LEDs follow /hardware/leds written by the dashboard while Live Mode is on.
 * Commands at /commands.json still control pump, sources, reuse, and filtration.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* FIREBASE_URL = "https://jaalloop-4d51a-default-rtdb.asia-southeast1.firebasedatabase.app";

#define TRIG_COL    5
#define ECHO_COL    18
#define TRIG_REC    19
#define ECHO_REC    21
#define TRIG_FRESH  22
#define ECHO_FRESH  23
#define TURBIDITY_PIN  34

#define LED_RO              4
#define LED_WASHING         12
#define LED_RAIN            14
#define LED_COLLECTION      27
#define LED_FILTER1         26
#define LED_FILTER2         16
#define LED_FILTER3         33
#define LED_PUMP            32
#define LED_RECYCLED        15
#define LED_REUSE_TOILET    2
#define LED_REUSE_GARDEN    17
#define LED_REUSE_CLEANING  13
#define LED_SYSTEM          25
#define BTN_PUMP            0

#define COL_TANK_HEIGHT_CM    30.0
#define REC_TANK_HEIGHT_CM    60.0
#define FRESH_TANK_HEIGHT_CM  80.0

const unsigned long UPLOAD_INTERVAL  = 2000;
const unsigned long COMMAND_INTERVAL = 800;
const unsigned long LED_INTERVAL     = 400;

bool pumpRunning = false;
bool filterActive = false;
int  filtrationStage = 0;
bool roActive = true;
bool washingActive = true;
bool rainActive = true;
bool reuseActive = false;
bool btnLastState = HIGH;
bool heartbeatState = false;

unsigned long lastUploadMs = 0;
unsigned long lastCommandMs = 0;
unsigned long lastLedMs = 0;
unsigned long lastHeartbeatMs = 0;

float readDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return 100.0;
  return (duration * 0.0343f) / 2.0f;
}

float distanceToPct(float distCm, float tankHeightCm) {
  float waterHeight = tankHeightCm - distCm;
  if (waterHeight < 0) waterHeight = 0;
  return constrain((waterHeight / tankHeightCm) * 100.0f, 0.0f, 100.0f);
}

void patchFirebase(const char* path, const String& jsonBody) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + path);
  http.setConnectTimeout(2000);
  http.setTimeout(2000);
  http.addHeader("Content-Type", "application/json");
  int code = http.PATCH(jsonBody);
  Serial.printf("[Firebase] PATCH %s → %d\n", path, code);
  http.end();
}

String getFirebase(const char* path) {
  if (WiFi.status() != WL_CONNECTED) return "";
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + path);
  http.setConnectTimeout(2000);
  http.setTimeout(2000);
  int code = http.GET();
  String resp = "";
  if (code == 200) resp = http.getString();
  http.end();
  return resp;
}

bool jsonFlag(JsonObject obj, const char* key, bool fallback) {
  if (!obj.containsKey(key)) return fallback;
  if (obj[key].is<bool>()) return obj[key].as<bool>();
  if (obj[key].is<int>()) return obj[key].as<int>() != 0;
  String v = obj[key].as<String>();
  v.toUpperCase();
  return v == "ON" || v == "START" || v == "TRUE" || v == "1";
}

void applyLed(int pin, bool on) {
  digitalWrite(pin, on ? HIGH : LOW);
}

void applyFlowLeds(bool ro, bool washing, bool rain, bool collection,
                   bool f1, bool f2, bool f3, bool pump, bool recycled,
                   bool reuseT, bool reuseG, bool reuseC) {
  applyLed(LED_RO, ro);
  applyLed(LED_WASHING, washing);
  applyLed(LED_RAIN, rain);
  applyLed(LED_COLLECTION, collection);
  applyLed(LED_FILTER1, f1);
  applyLed(LED_FILTER2, f2);
  applyLed(LED_FILTER3, f3);
  applyLed(LED_PUMP, pump);
  applyLed(LED_RECYCLED, recycled);
  applyLed(LED_REUSE_TOILET, reuseT);
  applyLed(LED_REUSE_GARDEN, reuseG);
  applyLed(LED_REUSE_CLEANING, reuseC);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\nJalLoop ESP32 — LED flow sync");

  pinMode(TRIG_COL, OUTPUT); pinMode(ECHO_COL, INPUT);
  pinMode(TRIG_REC, OUTPUT); pinMode(ECHO_REC, INPUT);
  pinMode(TRIG_FRESH, OUTPUT); pinMode(ECHO_FRESH, INPUT);

  int leds[] = {
    LED_RO, LED_WASHING, LED_RAIN, LED_COLLECTION,
    LED_FILTER1, LED_FILTER2, LED_FILTER3, LED_PUMP, LED_RECYCLED,
    LED_REUSE_TOILET, LED_REUSE_GARDEN, LED_REUSE_CLEANING, LED_SYSTEM
  };
  for (int i = 0; i < 13; i++) pinMode(leds[i], OUTPUT);
  pinMode(BTN_PUMP, INPUT_PULLUP);

  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_SYSTEM, HIGH); delay(200);
    digitalWrite(LED_SYSTEM, LOW); delay(200);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long wifiStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 15000) {
    delay(400);
    digitalWrite(LED_SYSTEM, !digitalRead(LED_SYSTEM));
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi IP %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_SYSTEM, HIGH);
    patchFirebase("/device.json", "{\"status\":\"online\",\"firmware\":\"2.0.0\"}");
  } else {
    Serial.println("\nWiFi failed — offline LED preview only");
  }
}

void loop() {
  unsigned long now = millis();

  if (now - lastHeartbeatMs >= 500) {
    lastHeartbeatMs = now;
    heartbeatState = !heartbeatState;
    digitalWrite(LED_SYSTEM, heartbeatState ? HIGH : LOW);
  }

  float colPct = distanceToPct(readDistance(TRIG_COL, ECHO_COL), COL_TANK_HEIGHT_CM);
  float recPct = distanceToPct(readDistance(TRIG_REC, ECHO_REC), REC_TANK_HEIGHT_CM);
  float freshPct = distanceToPct(readDistance(TRIG_FRESH, ECHO_FRESH), FRESH_TANK_HEIGHT_CM);
  float colLiters = (colPct / 100.0f) * 100.0f;
  float recLiters = (recPct / 100.0f) * 200.0f;
  float freshLiters = (freshPct / 100.0f) * 1000.0f;

  int rawTurb = analogRead(TURBIDITY_PIN);
  float turbPct = (rawTurb / 4095.0f) * 100.0f;
  const char* waterQuality = turbPct > 70 ? "Good" : (turbPct > 40 ? "Fair" : "Poor");

  bool btnNow = digitalRead(BTN_PUMP);
  if (btnNow == LOW && btnLastState == HIGH) {
    pumpRunning = !pumpRunning;
    filterActive = pumpRunning;
    filtrationStage = pumpRunning ? 3 : 0;
    Serial.printf("[BTN] Pump %s\n", pumpRunning ? "ON" : "OFF");
    delay(50);
  }
  btnLastState = btnNow;

  if (now - lastLedMs >= LED_INTERVAL) {
    lastLedMs = now;
    String ledResp = getFirebase("/hardware/leds.json");
    bool usedRemote = false;
    if (ledResp.length() > 4 && ledResp != "null") {
      StaticJsonDocument<512> leds;
      if (!deserializeJson(leds, ledResp)) {
        JsonObject obj = leds.as<JsonObject>();
        applyFlowLeds(
          jsonFlag(obj, "ro", roActive),
          jsonFlag(obj, "washing", washingActive),
          jsonFlag(obj, "rain", rainActive),
          jsonFlag(obj, "collection", roActive || washingActive || rainActive),
          jsonFlag(obj, "filter1", filtrationStage >= 1),
          jsonFlag(obj, "filter2", filtrationStage >= 2),
          jsonFlag(obj, "filter3", filtrationStage >= 3),
          jsonFlag(obj, "pump", pumpRunning),
          jsonFlag(obj, "recycled", recLiters > 0),
          jsonFlag(obj, "reuseToilet", reuseActive),
          jsonFlag(obj, "reuseGarden", reuseActive),
          jsonFlag(obj, "reuseCleaning", reuseActive)
        );
        usedRemote = true;
      }
    }
    if (!usedRemote) {
      applyFlowLeds(
        roActive, washingActive, rainActive,
        roActive || washingActive || rainActive,
        filtrationStage >= 1, filtrationStage >= 2, filtrationStage >= 3,
        pumpRunning, recLiters > 0,
        reuseActive, reuseActive, reuseActive
      );
    }
  }

  if (now - lastUploadMs >= UPLOAD_INTERVAL) {
    lastUploadMs = now;
    StaticJsonDocument<768> doc;
    doc["collectionPct"] = round(colPct * 10) / 10.0;
    doc["collectionLiters"] = round(colLiters);
    doc["recycledPct"] = round(recPct * 10) / 10.0;
    doc["recycledLiters"] = round(recLiters);
    doc["freshTankPct"] = round(freshPct * 10) / 10.0;
    doc["freshLiters"] = round(freshLiters);
    doc["turbidity"] = round(turbPct);
    doc["waterQuality"] = waterQuality;
    doc["pumpRunning"] = pumpRunning;
    doc["filterActive"] = filterActive;
    doc["filtrationStage"] = filtrationStage;
    doc["roActive"] = roActive;
    doc["washingActive"] = washingActive;
    doc["rainActive"] = rainActive;
    doc["reuseActive"] = reuseActive;
    doc["uptime"] = now / 1000;
    String jsonStr;
    serializeJson(doc, jsonStr);
    patchFirebase("/sensorData.json", jsonStr);
  }

  if (now - lastCommandMs >= COMMAND_INTERVAL) {
    lastCommandMs = now;
    String resp = getFirebase("/commands.json");
    if (resp.length() > 4 && resp != "null") {
      StaticJsonDocument<512> cmd;
      if (!deserializeJson(cmd, resp)) {
        JsonObject obj = cmd.as<JsonObject>();
        if (obj.containsKey("pump")) {
          bool newState = jsonFlag(obj, "pump", pumpRunning);
          if (newState != pumpRunning) {
            pumpRunning = newState;
            if (pumpRunning) {
              filtrationStage = max(filtrationStage, 1);
              filterActive = true;
            } else {
              filtrationStage = 0;
              filterActive = false;
            }
            Serial.printf("[CMD] Pump %s\n", pumpRunning ? "ON" : "OFF");
          }
        }
        if (obj.containsKey("filtration")) {
          String v = obj["filtration"].as<String>();
          v.toUpperCase();
          if (v == "START" || v == "ON") {
            filterActive = true;
            filtrationStage = max(filtrationStage, 1);
          } else if (v == "STOP" || v == "OFF") {
            filterActive = false;
            filtrationStage = 0;
          }
        }
        if (obj.containsKey("filtrationStage")) {
          filtrationStage = obj["filtrationStage"].as<int>();
          filterActive = filtrationStage > 0;
        }
        if (obj.containsKey("ro")) roActive = jsonFlag(obj, "ro", roActive);
        if (obj.containsKey("washing")) washingActive = jsonFlag(obj, "washing", washingActive);
        if (obj.containsKey("rain")) rainActive = jsonFlag(obj, "rain", rainActive);
        if (obj.containsKey("reuse")) reuseActive = jsonFlag(obj, "reuse", reuseActive);
        if (obj.containsKey("reset") && obj["reset"].as<bool>() == true) {
          pumpRunning = false;
          filterActive = false;
          filtrationStage = 0;
          reuseActive = false;
          roActive = true;
          washingActive = true;
          rainActive = true;
          patchFirebase("/commands.json", "{\"reset\":false}");
        }
      }
    }
  }

  delay(40);
}
