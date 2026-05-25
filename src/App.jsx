import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StatCards from './components/StatCards';
import RevenueChart from './components/RevenueChart';
import RecentOrders from './components/RecentOrders';

// Import 3 trang mới tạo
import OrdersPage from './components/OrdersPage';
import ProductsPage from './components/ProductsPage';
import CustomersPage from './components/CustomersPage';

// Component chứa giao diện trang Tổng Quan cũ của bạn
function DashboardOverview() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xin chào, Hoài Phong 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Dưới đây là tình hình kinh doanh của cửa hàng hôm nay.</p>
        </div>
      </div>
      <StatCards />
      <RevenueChart />
      <RecentOrders />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar cố định bên trái ở mọi trang */}
        <Sidebar />

        {/* Nội dung bên phải sẽ thay đổi linh hoạt theo URL */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}