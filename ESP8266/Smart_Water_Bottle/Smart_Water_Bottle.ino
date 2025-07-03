#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <DHT.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include "HX711.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "Hasalanka’s iPhone";
const char* password = "aaaaaaaa";

FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define DT D3
#define SCK D4
HX711 scale;

#define DHTPIN D2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define RXPin D7
#define TXPin D8
TinyGPSPlus gps;
SoftwareSerial gpsSerial(RXPin, TXPin);

#define LED_PIN D6
#define SOS_BUTTON D5

float previousWeight = 0;
float consumedWater = 0;
float hourlyIntake = 0;
float targetIntake = 0;
bool firstReading = false;
unsigned long hourStartTime = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.begin();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Smart Bottle");
  delay(2000);
  lcd.clear();
  scale.begin(DT, SCK);
  scale.set_scale(1073.24);
  scale.tare();
  delay(2000);
  previousWeight = scale.get_units(10);
  gpsSerial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOS_BUTTON, INPUT_PULLUP);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  config.database_url = "https://smartbottle-5eeba-default-rtdb.asia-southeast1.firebasedatabase.app";
  config.signer.tokens.legacy_token = "jwxzJIMRZRKzyScLWB9TOYUXwjSskEBo4ITHR3Ny";
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  hourStartTime = millis();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  if (isnan(temp) || isnan(hum)) {
    delay(2000);
    return;
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(temp, 1);
  lcd.print("C");
  lcd.setCursor(0, 1);
  lcd.print("Hum: ");
  lcd.print(hum, 1);
  lcd.print("%");

  float currentWeight = scale.get_units(10);
  if (!firstReading) {
    previousWeight = currentWeight;
    firstReading = true;
  }
  if (currentWeight < previousWeight) {
    float intake = previousWeight - currentWeight;
    consumedWater += intake;
    hourlyIntake += intake;
  }
  if (currentWeight < 0) currentWeight = 0;
  previousWeight = currentWeight;
  targetIntake = predictWaterNeed(temp, hum);

  unsigned long start = millis();
  while (millis() - start < 2000) {
    while (gpsSerial.available()) {
      gps.encode(gpsSerial.read());
    }
  }

  String date = "unknown";
  String timeString = "unknown";
  if (gps.date.isValid()) {
    char dateBuffer[11];
    sprintf(dateBuffer, "%04d-%02d-%02d", gps.date.year(), gps.date.month(), gps.date.day());
    date = String(dateBuffer);
  }
  if (gps.time.isValid()) {
    char timeBuffer[9];
    sprintf(timeBuffer, "%02d:%02d:%02d", gps.time.hour(), gps.time.minute(), gps.time.second());
    timeString = String(timeBuffer);
  }

  float lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  float lng = gps.location.isValid() ? gps.location.lng() : 0.0;
  float alt = gps.altitude.isValid() ? gps.altitude.meters() : 0.0;

  Serial.println("======== Smart Bottle ========");
  Serial.println("GPS Date: " + date);
  Serial.println("GPS Time: " + timeString);
  Serial.println("Temperature: " + String(temp));
  Serial.println("Humidity: " + String(hum));
  Serial.println("Water left (ml): " + String(currentWeight));
  Serial.println("Water consumed (ml): " + String(consumedWater));
  Serial.println("Hourly intake (ml): " + String(hourlyIntake));
  Serial.println("------------------------------");

  if (Firebase.ready()) {
    Firebase.setFloat(fbdo, "/current/temp", temp);
    Firebase.setFloat(fbdo, "/current/humidity", hum);
    Firebase.setFloat(fbdo, "/current/lat", lat);
    Firebase.setFloat(fbdo, "/current/lng", lng);
    Firebase.setFloat(fbdo, "/current/alt", alt);
    Firebase.setFloat(fbdo, "/current/hour_target_ml", targetIntake);
    Firebase.setFloat(fbdo, "/current/hour_drunk_ml", hourlyIntake);
    Firebase.setFloat(fbdo, "/current/water_left_ml", currentWeight);
    Firebase.setFloat(fbdo, "/current/water_consumed_ml", consumedWater);
    if (date != "unknown") {
      Firebase.setFloat(fbdo, "/bottle/" + date + "/water_left_ml", currentWeight);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/target_ml", targetIntake);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/temp", temp);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/humidity", hum);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/lat", lat);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/lng", lng);
      Firebase.setFloat(fbdo, "/bottle/" + date + "/alt", alt);
      Firebase.setString(fbdo, "/bottle/" + date + "/time", timeString);
    }
  }

  if (digitalRead(SOS_BUTTON) == LOW) {
    Firebase.setString(fbdo, "/alerts/sos", "SOS PRESSED!");
    Firebase.setString(fbdo, "/alerts/sos_time", timeString);
    delay(3000);
  }

  if (millis() - hourStartTime >= 3600000) {
    if (hourlyIntake < targetIntake) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
    hourlyIntake = 0;
    hourStartTime = millis();
  }

  delay(60000);
}

float predictWaterNeed(float temp, float hum) {
  float base = 200;
  float tempFactor = (temp - 25) * 10;
  float humFactor = (hum < 50) ? 100 : 0;
  return constrain(base + tempFactor + humFactor, 200, 600);
}
