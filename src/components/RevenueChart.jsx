import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios'; // Đồng bộ sử dụng axios thuần để loại bỏ rủi ro sai đường dẫn base

export default function RevenueChart() {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Trạng thái đợi tải dữ liệu

    useEffect(() => {
        // Gọi chính xác endpoint phân tích dữ liệu của dashboard
        axios.get('http://127.0.0.1:8000/api/dashboard/chart')
            .then(res => {
                // Kiểm tra an toàn xem dữ liệu trả về có đúng định dạng mảng của Recharts không
                if (Array.isArray(res.data)) {
                    setChartData(res.data);
                } else {
                    console.error("Dữ liệu biểu đồ trả về không đúng định dạng mảng:", res.data);
                    setChartData([]);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải dữ liệu biểu đồ phân tích:", err);
                setChartData([]); // Đảm bảo mảng rỗng để biểu đồ không bị crash
            })
            .finally(() => {
                setIsLoading(false); // Hoàn thành quá trình tải
            });
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Phân Tích Doanh Thu</h2>
                    <p className="text-xs text-gray-400">Thống kê doanh số và lượng đơn hàng theo tháng</p>
                </div>
                <select className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 outline-none cursor-pointer hover:border-gray-300">
                    <option>6 tháng gần nhất</option>
                    <option>Năm nay</option>
                </select>
            </div>

            <div className="w-full h-80 flex items-center justify-center">
                {isLoading ? (
                    // Hiển thị trạng thái đang tải dữ liệu trực quan
                    <div className="text-sm text-gray-400 animate-pulse">Đang nạp dữ liệu thống kê bãi kho...</div>
                ) : chartData.length > 0 ? (
                    // Chỉ vẽ biểu đồ khi mảng dữ liệu có phần tử thực tế
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit=" Tr" />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit=" đơn" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Bar yAxisId="left" dataKey="Doanh thu (Triệu)" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Line yAxisId="right" type="monotone" dataKey="Số đơn hàng" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    // Hiển thị thông báo nếu không có dữ liệu thay vì để đồ thị trống trơn hoặc sập giao diện
                    <div className="text-sm text-gray-400">Chưa có dữ liệu thống kê doanh thu trong khoảng thời gian này.</div>
                )}
            </div>
        </div>
    );
}