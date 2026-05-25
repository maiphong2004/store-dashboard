import React from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
    const products = [
        { id: 1, name: "Thép cuộn Phi 6 Hòa Phát", category: "Vật liệu thô", price: "15,500,000 đ / Tấn", stock: 45, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=60" },
        { id: 2, name: "Xi măng Insee Đa Dụng PCB40", category: "Vật liệu thô", price: "88,000 đ / Bao", stock: 650, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=60" },
        { id: 3, name: "Gạch ống Tuynel 8x18", category: "Vật liệu thô", price: "1,200 đ / Viên", stock: 25000, image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=150&auto=format&fit=crop&q=60" },
        { id: 4, name: "Sơn bóng nội thất Dulux 5in1", category: "Vật liệu hoàn thiện", price: "1,450,000 đ / Thùng", stock: 85, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60" },
        { id: 5, name: "Dây cáp điện Cadivi 2.5 mm", category: "Điện nước", price: "750,000 đ / Cuộn", stock: 0, image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&auto=format&fit=crop&q=60" }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Vật Tư / Sản Phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý danh mục sắt thép, xi măng, kho bãi và giá phân phối.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors w-fit">
                    <Plus className="w-4 h-4" /> Thêm vật tư mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm kiếm vật tư theo tên hoặc mã sản phẩm..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:border-indigo-500 transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                        <div className="p-5 flex gap-4">
                            <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-100" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{product.category}</span>
                                <h3 className="text-base font-bold text-gray-800 mt-1.5 truncate" title={product.name}>{product.name}</h3>
                                <p className="text-lg font-extrabold text-gray-900 mt-1">{product.price}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50/70 px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                            <span className={`text-xs font-medium ${product.stock > 0 ? 'text-gray-500' : 'text-rose-600 font-semibold'}`}>
                                {product.stock > 0 ? `Tồn kho: ${product.stock.toLocaleString()}` : 'Hết hàng (Cần nhập kho gấp)'}
                            </span>
                            <div className="flex gap-1">
                                <button className="p-1.5 hover:bg-gray-200/60 rounded-lg text-gray-500 hover:text-gray-700 transition" title="Sửa">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-500 hover:text-rose-600 transition" title="Xóa">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}