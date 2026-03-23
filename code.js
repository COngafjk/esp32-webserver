const express = require('express');
const cors = require('cors');
const path = require('path'); // Thêm thư viện này để xử lý đường dẫn file

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

let sensorData = {
    temperature: 0,
    humidity: 0,
    timestamp: null
};

// 1. Nhận dữ liệu từ ESP32
app.post('/api/data', (req, res) => {
    const { temperature, humidity } = req.body;
    if (temperature !== undefined && humidity !== undefined) {
        sensorData = {
            temperature: temperature,
            humidity: humidity,
            timestamp: new Date().toLocaleString('vi-VN')
        };
        console.log("📥 Đã nhận dữ liệu từ ESP32:", sensorData);
        res.status(200).json({ message: "Đã lưu!" });
    } else {
        res.status(400).json({ message: "Lỗi!" });
    }
});

// 2. Trả dữ liệu JSON cho trang Web
app.get('/api/data', (req, res) => {
    res.status(200).json(sensorData);
});

// 3. MỚI: Hiển thị giao diện Web khi vào localhost:3000
app.get('/', (req, res) => {
    // Lệnh này ném file index.html lên trình duyệt
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    console.log(`👉 Xem bảng điều khiển tại: http://localhost:${PORT}`);
});
