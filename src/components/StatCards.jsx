import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Layers, Users, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

export default function StatCards() {
    // Khởi tạo trạng thái lưu dữ liệu thống kê động ban đầu
    const [stats, setStats] = useState({
        total_revenue: "0 đ",
        new_orders: "0 đơn",
        stock_count: "0",
        customer_count: "0 nhà thầu",
        revenue_change: "+0%"
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // SỬA ĐỔI: Gọi đúng endpoint lấy dữ liệu tổng hợp (stats) thay vì dữ liệu biểu đồ (chart)
        axios.get('http://127.0.0.1:8000/api/dashboard/stats')
            .then(res => {
                // SỬA ĐỔI: Sử dụng setStats để cập nhật dữ liệu thay vì setChartData không tồn tại
                if (res.data) {
                    setStats({
                        total_revenue: res.data.total_revenue || "0 đ",
                        new_orders: res.data.new_orders || "0 đơn",
                        stock_count: res.data.stock_count || "0",
                        customer_count: res.data.customer_count || "0 nhà thầu",
                        revenue_change: res.data.revenue_change || "+0%"
                    });
                }
            })
            .catch(err => {
                console.error("Lỗi tải dữ liệu thống kê tổng quan Dashboard:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Cấu trúc danh sách các thẻ thống kê
    const cardItems = [
        {
            title: "Tổng Doanh Thu (Đơn hoàn thành)",
            value: stats.total_revenue,
            change: stats.revenue_change,
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Tổng Đơn Hàng Hệ Thống",
            value: stats.new_orders,
            change: "+3 đơn mới", // Có thể đổi thành stats.orders_change nếu backend hỗ trợ
            icon: ShoppingBag,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            title: "Tổng Vật Tư Tồn Kho",
            value: stats.stock_count,
            change: "Đủ cung ứng",
            icon: Layers,
            color: "bg-amber-50 text-amber-600"
        },
        {
            title: "Số Nhà Thầu Hợp Tác",
            value: stats.customer_count,
            change: "Đối tác có đơn",
            icon: Users,
            color: "bg-sky-50 text-sky-600"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cardItems.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {card.title}
                            </span>

                            {isLoading ? (
                                // Hiệu ứng loading nhẹ trong lúc đợi API phản hồi
                                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
                            ) : (
                                <h2 className="text-2xl font-extrabold text-gray-900">
                                    {card.value}
                                </h2>
                            )}

                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> {card.change}
                            </span>
                        </div>
                        <div className={`p-3.5 rounded-xl ${card.color} shrink-0`}>
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}