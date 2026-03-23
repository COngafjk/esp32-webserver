#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// --- CẤU HÌNH WIFI ---
const char* ssid = "Redmi Note 10 Pro";
const char* password = "kkkkkkkk";

// --- CẤU HÌNH SERVER ---
// Thay 192.168.1.xxx bằng địa chỉ IPv4 máy tính chạy Node.js của bạn
const char* serverName = "http://192.168.107.238:3000/api/data";

// --- CẤU HÌNH CẢM BIẾN DHT11 ---
#define DHTPIN 4      // Chân data của DHT11 nối với GPIO 4 của ESP32
#define DHTTYPE DHT11 // Loại cảm biến là DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  
  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Đã kết nối WiFi. IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Chờ 5 giây giữa các lần gửi
  delay(5000); 

  // Kiểm tra kết nối WiFi
  if(WiFi.status() == WL_CONNECTED){
    
    // Đọc nhiệt độ và độ ẩm
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Kiểm tra xem có đọc lỗi không
    if (isnan(h) || isnan(t)) {
      Serial.println("Lỗi: Không thể đọc dữ liệu từ DHT11!");
      return;
    }

    Serial.printf("Nhiệt độ: %.2f °C, Độ ẩm: %.2f %%\n", t, h);

    // Khởi tạo HTTP Client
    HTTPClient http;
    http.begin(serverName);

    // Thiết lập Header để server biết mình đang gửi JSON
    http.addHeader("Content-Type", "application/json");

    // Tạo chuỗi JSON thủ công (không cần cài thêm thư viện ArduinoJson cho nhẹ)
    String httpRequestData = "{\"temperature\":" + String(t) + ",\"humidity\":" + String(h) + "}";

    // Gửi POST request
    int httpResponseCode = http.POST(httpRequestData);

    // Xử lý phản hồi từ server
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println("Server trả về: " + payload);
    } else {
      Serial.print("Lỗi khi gửi POST: ");
      Serial.println(httpResponseCode);
    }

    // Đóng kết nối
    http.end();
  } else {
    Serial.println("Mất kết nối WiFi");
  }
}
