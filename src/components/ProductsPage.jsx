import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Trash2, Edit3, AlertTriangle, CheckCircle, XCircle, PackagePlus } from 'lucide-react';
import axios from 'axios';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [stockFilter, setStockFilter] = useState("all");

    // STATE PHỤC VỤ TÍNH NĂNG NHẬP KHO NHANH
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockProduct, setRestockProduct] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        category: 'Thô',
        price: '',
        stock: 0
    });

    const fetchProducts = () => {
        axios.get('http://127.0.0.1:8000/api/dashboard/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error("Lỗi tải danh sách vật tư:", err));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // HÀM MỚI: Xử lý thay đổi dữ liệu form chung để tránh lỗi đóng băng input/select trong React
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            stock: parseInt(formData.stock, 10) || 0
        };

        if (editingId) {
            axios.put(`http://127.0.0.1:8000/api/dashboard/products/${editingId}`, dataToSend)
                .then(() => {
                    setIsModalOpen(false);
                    resetForm();
                    fetchProducts();
                })
                .catch(err => console.error(err));
        } else {
            axios.post('http://127.0.0.1:8000/api/dashboard/products', dataToSend)
                .then(() => {
                    setIsModalOpen(false);
                    resetForm();
                    fetchProducts();
                })
                .catch(err => console.error(err));
        }
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(quantityToAdd, 10);
        if (!qty || qty <= 0) return alert("Vui lòng nhập số lượng hợp lệ lớn hơn 0!");

        axios.patch(`http://127.0.0.1:8000/api/dashboard/products/${restockProduct.id}/restock`, {
            quantity_to_add: qty
        })
            .then(() => {
                setIsRestockModalOpen(false);
                setQuantityToAdd("");
                setRestockProduct(null);
                fetchProducts();
            })
            .catch(err => {
                console.error(err);
                alert("Có lỗi xảy ra trong quá trình nhập kho bổ sung!");
            });
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            category: product.category || 'Thô',
            price: product.price,
            stock: product.stock
        });
        setIsModalOpen(true);
    };

    const handleDeleteProduct = (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vật tư "${name}" ra khỏi danh mục kho không?`)) {
            // Đảm bảo truyền thuần o.id (ví dụ: 1) chứ không truyền chuỗi kèm chữ "#VT-1"
            axios.delete(`http://127.0.0.1:8000/api/dashboard/products/${id}`)
                .then(() => {
                    alert("Đã xóa sản phẩm thành công!");
                    fetchProducts(); // Tải lại danh sách mới
                })
                .catch(err => {
                    console.error("Lỗi khi xóa:", err);
                    alert("Không thể xóa vật tư. Vui lòng kiểm tra lại log Backend!");
                });
        }
    };

    // TỐI ƯU: Đảm bảo xóa editingId về null để không bị lỗi Thêm lộn sang Sửa
    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', category: 'Thô', price: '', stock: 0 });
    };

    // Hàm đóng Modal an toàn
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: "Hết hàng", color: "bg-rose-50 text-rose-600 border-rose-200", icon: <XCircle className="w-3.5 h-3.5" /> };
        if (stock <= 50) return { label: "Sắp hết", color: "bg-amber-50 text-amber-600 border-amber-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
        return { label: "Còn hàng", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;
        if (stockFilter === "low") return p.stock > 0 && p.stock <= 50;
        if (stockFilter === "out") return p.stock === 0;
        return true;
    });

    const countLowStock = products.filter(p => p.stock > 0 && p.stock <= 50).length;
    const countOutStock = products.filter(p => p.stock === 0).length;

    return (
        <div className="p-8 bg-gray-50 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Danh Mục Vật Tư / Hàng Hóa</h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống hỗ trợ nhập kho nhanh cho xe chở hàng biên nhận bổ sung vật tư bãi bồn.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors w-fit"
                >
                    <Plus className="w-4 h-4" /> Thêm vật tư mới
                </button>
            </div>

            {/* Thanh Tab Bộ lọc */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setStockFilter("all")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${stockFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>Tất cả ({products.length})</button>
                <button onClick={() => setStockFilter("low")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${stockFilter === "low" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-600 border-amber-200 hover:bg-amber-50/50"}`}><AlertTriangle className="w-3.5 h-3.5" /> Sắp hết hàng ({countLowStock})</button>
                <button onClick={() => setStockFilter("out")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${stockFilter === "out" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50/50"}`}><XCircle className="w-3.5 h-3.5" /> Đã hết hàng ({countOutStock})</button>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm theo tên vật tư, nhóm hàng hóa..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:border-indigo-500 transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Bảng Hiển Thị Dữ Liệu Vật Tư */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4 w-16">Mã Số</th>
                                <th className="p-4">Tên Vật Tư / Quy Cách</th>
                                <th className="p-4">Phân Nhóm</th>
                                <th className="p-4">Đơn Giá Tham Khảo</th>
                                <th className="p-4">Số Lượng Tồn</th>
                                <th className="p-4">Trạng Thái Kho</th>
                                <th className="p-4 text-center w-36">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    const status = getStockStatus(product.stock);
                                    return (
                                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                            <td className="py-4 font-medium text-gray-800">#{product.id}</td>
                                            <td className="py-4 text-gray-700">{product.name}</td>
                                            <td className="py-4 text-gray-500">{product.category}</td>
                                            <td className="py-4 font-semibold">{product.price}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {product.stock > 0 ? product.stock : 'Hết hàng'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* NÚT SỬA */}
                                                    <button
                                                        onClick={() => handleEditClick(product)}
                                                        className="text-gray-400 hover:text-indigo-600 p-1 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    {/* NÚT XÓA */}
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400 bg-white">Không tìm thấy mã vật tư nào khớp với bộ lọc.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: NHẬP KHO BỔ SUNG NHANH */}
            {isRestockModalOpen && restockProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100 relative mx-4">
                        <button onClick={() => { setIsRestockModalOpen(false); setQuantityToAdd(""); }} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Nhập Kho Bổ Sung</h2>
                        <p className="text-xs text-gray-500 mb-4">Cộng dồn số lượng thực tế xe giao cho vật tư: <strong className="text-gray-700">{restockProduct.name}</strong></p>

                        <form onSubmit={handleRestockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Số Lượng Hàng Về Thêm</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    autoFocus
                                    placeholder="Ví dụ: 500"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-blue-500 transition-colors font-bold text-blue-600"
                                    value={quantityToAdd}
                                    onChange={(e) => setQuantityToAdd(e.target.value)}
                                />
                                <div className="text-[11px] text-gray-400 mt-1">Tồn kho hiện tại trong bãi: {restockProduct.stock.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => { setIsRestockModalOpen(false); setQuantityToAdd(""); }} className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-medium transition">Hủy</button>
                                <button type="submit" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition shadow-sm">Xác nhận cộng kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: THÊM / SỬA VẬT TƯ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 relative mx-4">
                        <button onClick={handleCloseModal} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? "Cập Nhật Thông Tin Vật Tư" : "Khai Báo Vật Tư Mới"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Vật Tư / Tên Sản Phẩm chuẩn</label>
                                <input type="text" name="name" required placeholder="Ví dụ: Thép cuộn Phi 6 Hòa Phát" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phân Nhóm</label>
                                    <select name="category" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors bg-white" value={formData.category} onChange={handleInputChange}>
                                        <option value="Thô">Vật tư Thô</option>
                                        <option value="Hoàn thiện">Vật tư Hoàn thiện</option>
                                        <option value="Điện nước">Điện nước</option>
                                        <option value="Kết cấu">Kết cấu</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Tồn Kho</label>
                                    <input type="number" name="stock" min="0" required className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.stock} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn Giá Kèm Chuỗi Đơn Vị</label>
                                <input type="text" name="price" required placeholder="Ví dụ: 15,400,000 đ / Tấn" className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-500 transition-colors" value={formData.price} onChange={handleInputChange} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition">Hủy bỏ</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm">Lưu dữ liệu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}