import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Dùng Link và useLocation để nhận biết trang hiện tại
import { LayoutDashboard, ShoppingCart, Package, Users } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    // TỐI ƯU LOGIC: Kiểm tra thông minh bằng startsWith để giữ trạng thái Active ngay cả khi vào trang con
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-gray-800">StoreAdmin</span>
                </div>

                <nav className="space-y-1">
                    <Link to="/" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <LayoutDashboard className="w-5 h-5" /> Tổng quan
                    </Link>
                    <Link to="/orders" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/orders') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <ShoppingCart className="w-5 h-5" /> Đơn hàng
                    </Link>
                    <Link to="/products" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/products') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Package className="w-5 h-5" /> Sản phẩm
                    </Link>
                    <Link to="/customers" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/customers') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Users className="w-5 h-5" /> Khách hàng
                    </Link>
                </nav>
            </div>

            {/* Phần thông tin tài khoản admin hiển thị dưới đáy Sidebar */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                    HP
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-700">Hoài Phong</p>
                    <p className="text-xs text-gray-400">Quản trị viên kho</p>
                </div>
            </div>
        </aside>
    );
}