import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ArrowDownToLine } from 'lucide-react';
import axios from 'axios';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/dashboard/recent-orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error("Lỗi tải danh sách đơn hàng:", err));
    }, []);

    // Bộ lọc tìm kiếm an toàn dựa trên tên trường dữ liệu gốc từ Database (customer_name & product_name)
    const filteredOrders = orders.filter(order => {
        const customerName = order && order.customer_name ? order.customer_name.toLowerCase() : "";
        const productName = order && order.product_name ? order.product_name.toLowerCase() : "";
        const search = searchTerm ? searchTerm.toLowerCase() : "";

        return customerName.includes(search) || productName.includes(search);
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Trang */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Xem, tìm kiếm và quản lý trạng thái các đơn hàng của hệ thống.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors w-fit">
                    <ArrowDownToLine className="w-4 h-4" /> Xuất file Excel
                </button>
            </div>

            {/* Thanh Tìm Kiếm & Bộ Lọc */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng, sản phẩm..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Filter className="w-4 h-4" /> Bộ lọc
                </button>
            </div>

            {/* Bảng Danh Sách Đơn Hàng */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">Mã Đơn</th>
                                <th className="p-4">Khách Hàng</th>
                                <th className="p-4">Sản Phẩm</th>
                                <th className="p-4">Thời Gian</th>
                                <th className="p-4">Tổng Tiền</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                                        {/* Hiển thị chính xác tên cột theo dữ liệu mẫu từ DB backend */}
                                        <td className="p-4 font-medium text-gray-800">{order.customer_name}</td>
                                        <td className="p-4 text-gray-500">{order.product_name}</td>
                                        <td className="p-4 text-gray-400">{order.date}</td>
                                        <td className="p-4 font-semibold text-gray-800">{order.amount}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {order.status === 'Completed' ? 'Đã hoàn thành' : order.status === 'Pending' ? 'Đang xử lý' : 'Đã hủy'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors inline-flex items-center" title="Xem chi tiết">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 bg-white">
                                        Không tìm thấy đơn hàng nào khớp với từ khóa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}