import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import api from '../api'; // Gọi Axios Instance tập trung

export default function StatCards() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Lỗi khi tải số liệu stats:", err));
    }, []);

    // Sử dụng toán tử ?. (Optional Chaining) để tránh lỗi crash màn hình khi đang đợi API trả dữ liệu
    const cardData = [
        { title: "Tổng Doanh Thu", value: stats?.total_revenue || "0 đ", change: stats?.revenue_change || "0%", bg: "bg-emerald-50", icon: DollarSign, color: "text-emerald-600" },
        { title: "Đơn Hàng Mới", value: stats?.new_orders || "0 đơn", change: "+5%", bg: "bg-blue-50", icon: ShoppingCart, color: "text-blue-600" },
        { title: "Sản Phẩm Trong Kho", value: stats?.stock_count || "0 SP", change: "Đầy đủ", bg: "bg-amber-50", icon: Package, color: "text-amber-600" },
        { title: "Khách Hàng", value: stats?.customer_count || "0 người", change: "+10%", bg: "bg-purple-50", icon: Users, color: "text-purple-600" }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardData.map((card, index) => {
                const IconComponent = card.icon;
                return (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${card.color} ${card.bg}`}>
                                {card.change}
                            </span>
                        </div>
                        <div className={`p-4 rounded-xl ${card.bg}`}>
                            <IconComponent className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}