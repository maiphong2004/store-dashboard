import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../api';

export default function RevenueChart() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        api.get('/chart')
            .then(res => setChartData(res.data))
            .catch(err => console.error("Lỗi khi tải dữ liệu biểu đồ:", err));
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

            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit=" Tr" />
                        <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="đơn" />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar yAxisId="left" dataKey="Doanh thu (Triệu)" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line yAxisId="right" type="monotone" dataKey="Đơn hàng" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}