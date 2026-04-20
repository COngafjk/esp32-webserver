const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// --- [NHÓM 1: BIẾN LƯU TRỮ TRẠNG THÁI] ---
let sensorData = {
    temperature: 0,
    humidity: 0,
    timestamp: null
};

let alertThreshold = 40; // Ngưỡng nhiệt độ cảnh báo mặc định

// --- [NHÓM 2: CÁC HÀM XỬ LÝ API] ---

// API 1: Nhận dữ liệu từ ESP32 gửi lên
app.post('/api/data', (req, res) => {
    const { temperature, humidity } = req.body;
    
    if (temperature !== undefined && humidity !== undefined) {
        // Cập nhật dữ liệu mới nhất vào biến tạm
        sensorData.temperature = temperature;
        sensorData.humidity = humidity;
        sensorData.timestamp = new Date().toLocaleString('vi-VN');

        console.log(`[ESP32] T: ${temperature}°C | Ngưỡng hiện tại: ${alertThreshold}°C`);

        // TRẢ VỀ: Gửi kèm ngưỡng cảnh báo để ESP32 cập nhật theo
        res.status(200).json({ 
            status: "success",
            currentThreshold: alertThreshold 
        });
    } else {
        res.status(400).json({ status: "error", message: "Thiếu dữ liệu!" });
    }
});

// API 2: Cung cấp dữ liệu cho Web Dashboard
app.get('/api/data', (req, res) => {
    // Web sẽ lấy cả dữ liệu cảm biến và ngưỡng cảnh báo ở đây
    res.status(200).json({
        ...sensorData,
        alertThreshold: alertThreshold
    });
});

// API 3: Nhận lệnh thay đổi ngưỡng từ giao diện Web
app.post('/api/threshold', (req, res) => {
    const { threshold } = req.body;
    if (threshold !== undefined) {
        alertThreshold = parseFloat(threshold);
        console.log(`[WEB] Thay đổi ngưỡng cảnh báo thành: ${alertThreshold}°C`);
        res.status(200).json({ message: "Cập nhật ngưỡng thành công!" });
    } else {
        res.status(400).json({ message: "Giá trị ngưỡng không hợp lệ!" });
    }
});

// --- [NHÓM 3: KHỞI CHẠY SERVER] ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server IoT đang chạy tại: http://localhost:${PORT}`);
});

