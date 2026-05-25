import React, { useState, useEffect } from 'react';
import api from '../api';

export default function RecentOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        api.get('/recent-orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error("Lỗi khi tải danh sách đơn hàng:", err));
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Đơn Hàng Gần Đây</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-sm font-medium">
                            <th className="pb-3">MÃ ĐƠN</th>
                            <th className="pb-3">KHÁCH HÀNG</th>
                            <th className="pb-3">SẢN PHẨM</th>
                            <th className="pb-3">THỜI GIAN</th>
                            <th className="pb-3">TỔNG TIỀN</th>
                            <th className="pb-3">TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                <td className="py-4 font-semibold text-gray-700">#{order.id}</td>
                                <td className="py-4">{order.customer_name}</td>
                                <td className="py-4">{order.product_name}</td>
                                <td className="py-4 text-gray-400">{order.date}</td>
                                <td className="py-4 font-medium text-gray-800">{order.amount}</td>
                                <td className="py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                            order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {order.status === 'Completed' ? 'Đã hoàn thành' : order.status === 'Pending' ? 'Đang xử lý' : 'Đã hủy'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}