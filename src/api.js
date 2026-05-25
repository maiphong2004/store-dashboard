import axios from 'axios';

// Khởi tạo một cấu hình Axios dùng chung cho toàn bộ dự án
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/dashboard',
    timeout: 5000, // Tự động ngắt kết nối nếu server không phản hồi sau 5 giây
});

export default api;