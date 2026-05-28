import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Trash2, CheckCircle, Ban } from 'lucide-react';
import axios from 'axios';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cập nhật cấu hình Form lưu trữ trường dữ liệu quantity
    const [formData, setFormData] = useState({
        customer_name: '',
        product_name: 'Thép cuộn Phi 6 Hòa Phát', // Tên khớp chuẩn với mẫu DB ban đầu
        amount: '',
        status: 'Pending',
        quantity: 1 // Mặc định đặt mua từ 1 sản phẩm
    });

    const fetchOrders = () => {
        axios.get('http://127.0.0.1:8000/api/dashboard/recent-orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error("Lỗi tải danh sách đơn hàng:", err));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            quantity: parseInt(formData.quantity, 10) || 1
        };

        // Đảm bảo đường dẫn gọi đúng endpoint này
        axios.post('http://127.0.0.1:8000/api/dashboard/orders', dataToSend)
            .then(() => {
                setIsModalOpen(false);
                setFormData({ customer_name: '', product_name: 'Thép cuộn Phi 6 Hòa Phát', amount: '', status: 'Pending', quantity: 1 });
                fetchOrders();
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.detail) {
                    alert(err.response.data.detail);
                } else {
                    alert("Lỗi kết nối mạng hoặc sai đường dẫn API (404)!");
                    console.error(err);
                }
            });
    };

    const handleUpdateStatus = (id, newStatus) => {
        const numericId = typeof id === 'string' ? parseInt(id.replace('ĐH-', ''), 10) : id;
        axios.patch(`http://127.0.0.1:8000/api/dashboard/orders/${numericId}/status`, { status: newStatus })
            .then(() => fetchOrders())
            .catch(err => console.error(err));
    };

    const handleDeleteOrder = (id, customerName) => {
        const numericId = typeof id === 'string' ? parseInt(id.replace('ĐH-', ''), 10) : id;
        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng của "${customerName}" không?`)) {
            axios.delete(`http://127.0.0.1:8000/api/dashboard/orders/${numericId}`)
                .then(() => fetchOrders())
                .catch(err => console.error(err));
        }
    };

    const filteredOrders = orders.filter(order => {
        const customerName = order && order.customer_name ? order.customer_name.toLowerCase() : "";
        const productName = order && order.product_name ? order.product_name.toLowerCase() : "";
        const search = searchTerm.toLowerCase();
        return customerName.includes(search) || productName.includes(search);
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống tự động kiểm tra số lượng tồn kho và trừ hàng khi tạo đơn.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors w-fit"
                >
                    <Plus className="w-4 h-4" /> Tạo đơn hàng mới
                </button>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên nhà thầu, loại vật tư..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Filter className="w-4 h-4" /> Bộ lọc
                </button>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">Mã Đơn</th>
                                <th className="p-4">Nhà Thầu / Khách Hàng</th>
                                <th className="p-4">Vật Tư Hàng Hóa</th>
                                <th className="p-4">Thời Gian</th>
                                <th className="p-4">Tổng Giá Trị</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-center">Thao Tác Nhanh</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-4 font-bold text-gray-700">{order.id}</td>
                                        <td className="p-4 font-medium text-gray-800">{order.customer_name}</td>
                                        <td className="p-4 text-gray-500">{order.product_name}</td>
                                        <td className="p-4 text-gray-400">{order.date}</td>
                                        <td className="p-4 font-semibold text-gray-800">{order.amount}</td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold outline-none border cursor-pointer transition-colors ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                        'bg-rose-50 text-rose-600 border-rose-200'
                                                    }`}
                                            >
                                                <option value="Pending">Đang xử lý</option>
                                                <option value="Completed">Đã hoàn thành</option>
                                                <option value="Cancelled">Đã hủy</option>
                                            </select>
                                        </td>
                                        <td className="p-4 flex items-center justify-center gap-1.5">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'Completed')} className="p-1.5 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition" title="Hoàn thành đơn"><CheckCircle className="w-4 h-4" /></button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'Cancelled')} className="p-1.5 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-lg transition" title="Hủy đơn"><Ban className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteOrder(order.id, order.customer_name)} className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 bg-white">Không tìm thấy đơn hàng nào khớp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TẠO ĐƠN HÀNG MỚI ĐÃ ĐƯỢC TÍCH HỢP Ô NHẬP SỐ LƯỢNG */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 relative mx-4">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo Đơn Hàng Vật Tư Mới</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Nhà Thầu / Công Ty</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Công ty Xây dựng Coteccons"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                />
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Loại Vật Tư</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors bg-white"
                                        value={formData.product_name}
                                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                    >

                                        <option value="Thép cuộn Phi 6 Hòa Phát">Thép cuộn Phi 6 Hòa Phát</option>
                                        <option value="Xi măng Insee Đa Dụng PCB40">Xi măng Insee Đa Dụng PCB40</option>
                                        <option value="Gạch ống Tuynel 8x18">Gạch ống Tuynel 8x18</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Đặt</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng Giá Trị Đơn Hàng</label>
                                <input type="text" required placeholder="Ví dụ: 12,000,000 đ" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                                <select className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Pending">Đang xử lý (Trừ kho)</option>
                                    <option value="Completed">Đã hoàn thành (Trừ kho)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition">Hủy bỏ</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm">Lưu đơn hàng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}