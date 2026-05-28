import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Trash2, Edit3, Phone, MapPin, FileText } from 'lucide-react';
import axios from 'axios';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // Lưu ID nhà thầu nếu đang sửa

    // Cấu trúc Form quản lý dữ liệu Khách hàng
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        tax_code: '',
        status: 'Active'
    });

    // Hàm gọi API lấy danh sách nhà thầu từ FastAPI
    const fetchCustomers = () => {
        axios.get('http://127.0.0.1:8000/api/dashboard/customers')
            .then(res => setCustomers(res.data))
            .catch(err => console.error("Lỗi tải danh sách nhà thầu:", err));
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Xử lý gửi Form (Cả trường hợp Thêm mới hoặc Cập nhật)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            // Trường hợp ĐANG SỬA thông tin nhà thầu cũ
            axios.put(`http://127.0.0.1:8000/api/dashboard/customers/${editingId}`, formData)
                .then(() => {
                    setIsModalOpen(false);
                    resetForm(); // Đã bao gồm setEditingId(null) bên trong
                    fetchCustomers();
                })
                .catch(err => console.error("Lỗi sửa nhà thầu:", err));
        } else {
            // Trường hợp THÊM MỚI nhà thầu hoàn toàn
            axios.post('http://127.0.0.1:8000/api/dashboard/customers', formData)
                .then(() => {
                    setIsModalOpen(false);
                    resetForm();
                    fetchCustomers();
                })
                .catch(err => console.error("Lỗi thêm nhà thầu:", err));
        }
    };

    // Kích hoạt trạng thái sửa, đưa thông tin cũ lên Modal Form
    const handleEditClick = (customer) => {
        setEditingId(customer.id);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            tax_code: customer.tax_code,
            status: customer.status || 'Active'
        });
        setIsModalOpen(true);
    };

    // Xử lý xóa nhà thầu
    const handleDeleteCustomer = (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đối tác "${name}" khỏi hệ thống không?`)) {
            axios.delete(`http://127.0.0.1:8000/api/dashboard/customers/${id}`)
                .then(() => fetchCustomers())
                .catch(err => console.error("Lỗi xóa nhà thầu:", err));
        }
    };

    // SỬA ĐỔI: Đồng bộ đưa editingId về null khi dọn dẹp Form để không bị lẫn lộn giữa Thêm và Sửa
    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', phone: '', address: '', tax_code: '', status: 'Active' });
    };

    // Logic tìm kiếm nhà thầu theo tên, số điện thoại hoặc mã số thuế
    const filteredCustomers = customers.filter(c => {
        const name = c.name ? c.name.toLowerCase() : "";
        const phone = c.phone ? c.phone.toLowerCase() : "";
        const taxCode = c.tax_code ? c.tax_code.toLowerCase() : "";
        const search = searchTerm.toLowerCase();
        return name.includes(search) || phone.includes(search) || taxCode.includes(search);
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đối Tác / Nhà Thầu</h1>
                    <p className="text-sm text-gray-500 mt-1">Hồ sơ thông tin danh bạ nhà thầu cung ứng và thi công dự án.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors w-fit"
                >
                    <Plus className="w-4 h-4" /> Thêm nhà thầu mới
                </button>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên đối tác, số điện thoại, mã số thuế..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Filter className="w-4 h-4" /> Bộ lọc
                </button>
            </div>

            {/* Danh sách hiển thị dạng Card lưới */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative flex flex-col justify-between space-y-4">
                            {/* Khối thông tin chính */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">{customer.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {customer.status === 'Active' ? 'Đang hợp tác' : 'Tạm dừng'}
                                    </span>
                                </div>

                                {/* TỐI ƯU: Thêm giá trị fallback đề phòng trường hợp API trả về thuộc tính null/undefined */}
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                                    <div className="text-xs font-bold text-slate-700">
                                        {customer.rank || "Chưa xếp hạng"}
                                    </div>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium">
                                        {customer.discount || "0% Ưu đãi"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 pt-1">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span>{customer.phone || "Chưa cập nhật"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="line-clamp-1">{customer.address || "Chưa cập nhật"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span>MST: {customer.tax_code || "Chưa cấp"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* TỐI ƯU: Thêm toán tử logic `|| 0` để hàm gán đơn vị tiền tệ nội địa không bị crash giao diện */}
                            <div className="bg-indigo-50/40 p-3 rounded-xl flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Tích lũy đơn hàng:</span>
                                <span className="font-bold text-indigo-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent || 0)}
                                </span>
                            </div>

                            {/* Khu vực nút bấm Thao tác */}
                            <div className="border-t border-gray-50 pt-3 flex justify-end gap-2">
                                <button onClick={() => handleEditClick(customer)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Sửa thông tin"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCustomer(customer.id, customer.name)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Xóa đối tác"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-12 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl">Không tìm thấy thông tin nhà thầu nào phù hợp.</div>
                )}
            </div>

            {/* MODAL THÊM / SỬA THÔNG TIN NHÀ THẦU */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 relative mx-4">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? "Cập Nhật Hồ Sơ Nhà Thầu" : "Đăng Ký Nhà Thầu Mới"}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Doanh Nghiệp / Đối Tác</label>
                                <input type="text" required placeholder="Ví dụ: Tổng công ty Xây dựng Hòa Bình" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                                <input type="text" required placeholder="Ví dụ: 0901234567" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ Văn Phòng</label>
                                <input type="text" required placeholder="Ví dụ: Toà nhà Landmark 81, Bình Thạnh, TP.HCM" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Số Thuế</label>
                                    <input type="text" placeholder="Mã số doanh nghiệp" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.tax_code} onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                                    <select className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Đang hợp tác</option>
                                        <option value="Inactive">Tạm dừng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition">Hủy bỏ</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm">Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}