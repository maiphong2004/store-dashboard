import React from 'react';
import { Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

export default function CustomersPage() {
    const customers = [
        { id: 1, name: "Công ty Xây dựng Minh Đức", email: "vattu@minhduccon.vn", phone: "028.3456.7890", joined: "12/01/2025", totalSpend: "450,250,000 đ", ordersCount: 24, type: "Nhà thầu chiến lược" },
        { id: 2, name: "Đại lý VLXD Tuấn Nghĩa", email: "vlxdtuannghia@gmail.com", phone: "0988.777.666", joined: "05/02/2025", totalSpend: "185,820,000 đ", ordersCount: 12, type: "Đại lý cấp 2" },
        { id: 3, name: "Thầu xây dựng Lê Hoàng", email: "lehoang.build@gmail.com", phone: "0905.112.233", joined: "20/02/2025", totalSpend: "94,400,000 đ", ordersCount: 8, type: "Nhà thầu tư nhân" },
        { id: 4, name: "Cửa hàng điện nước Thành Phát", email: "thanhphat.me@gmail.com", phone: "0934.555.444", joined: "11/03/2025", totalSpend: "15,350,000 đ", ordersCount: 2, type: "Đại lý cấp 2" },
        { id: 5, name: "Nhà thầu Nguyễn Quốc Anh", email: "quocanh.co@gmail.com", phone: "0971.222.333", joined: "29/04/2025", totalSpend: "8,980,000 đ", ordersCount: 4, type: "Khách hàng lẻ" }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đối Tác / Khách Hàng</h1>
                <p className="text-sm text-gray-500 mt-1">Danh sách công ty xây dựng, nhà thầu công trình và đại lý nhập hàng.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">Tên Đối Tác / Doanh Nghiệp</th>
                                <th className="p-4">Liên Hệ Phòng Vật Tư</th>
                                <th className="p-4">Ngày Ký Hợp Đồng</th>
                                <th className="p-4 text-center">Số Đơn Đã Nhập</th>
                                <th className="p-4">Tổng Doanh Số</th>
                                <th className="p-4 text-center">Phân Loại</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">{customer.name}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        <span className="flex items-center gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5" /> {customer.joined}</span>
                                    </td>
                                    <td className="p-4 text-center font-semibold text-gray-700">
                                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs">
                                            <ShoppingBag className="w-3 h-3 text-gray-500" /> {customer.ordersCount} chuyến
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-950">{customer.totalSpend}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium inline-block ${customer.ordersCount >= 20 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                                            }`}>
                                            {customer.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}