from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from database import create_db_and_tables, get_session, Product, Customer, Order
from contextlib import asynccontextmanager
from database import engine
from pydantic import BaseModel
from fastapi import HTTPException
from sqlmodel import func
from collections import defaultdict

app = FastAPI()


# Khởi tạo dữ liệu mẫu Vật liệu xây dựng nếu DB trống
def seed_data_if_empty(session: Session):
    if len(session.exec(select(Order)).all()) == 0:
        sample_orders = [
            Order(
                id=1,
                customer_name="Công ty Xây dựng Minh Đức",
                product_name="Thép cuộn Phi 6 Hòa Phát (1 Tấn)",
                amount="15,500,000 đ",
                status="Completed",
                date="10 phút trước",
            ),
            Order(
                id=2,
                customer_name="Đại lý VLXD Tuấn Nghĩa",
                product_name="Xi măng Insee Đa Dụng (100 bao)",
                amount="8,800,000 đ",
                status="Pending",
                date="25 phút trước",
            ),
            Order(
                id=3,
                customer_name="Thầu xây dựng Lê Hoàng",
                product_name="Gạch ống tuynel Bình Dương (10,000 viên)",
                amount="12,000,000 đ",
                status="Completed",
                date="1 giờ trước",
            ),
            Order(
                id=4,
                customer_name="Cửa hàng điện nước Thành Phát",
                product_name="Dây cáp điện Cadivi 2.5mm (5 cuộn)",
                amount="3,750,000 đ",
                status="Cancelled",
                date="3 giờ trước",
            ),
            Order(
                id=5,
                customer_name="Nhà thầu Nguyễn Quốc Anh",
                product_name="Cát tô xây dựng (4 khối)",
                amount="1,400,000 đ",
                status="Pending",
                date="Hôm qua",
            ),
        ]
        for order in sample_orders:
            session.add(order)
        session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_data_if_empty(session)
    yield


app = FastAPI(title="Store Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/dashboard/stats")
def get_stats(session: Session = Depends(get_session)):
    # 1. Tính tổng doanh thu từ các đơn hàng có trạng thái "Completed" (Đã hoàn thành)
    # Lấy toàn bộ tiền của đơn hoàn thành về để xử lý chuỗi
    completed_orders = session.exec(
        select(Order).where(Order.status == "Completed")
    ).all()
    total_revenue_int = 0
    for order in completed_orders:
        try:
            # Xóa các ký tự " đ" và dấu phẩy để ép về kiểu số tính toán
            clean_amount = order.amount.replace(" đ", "").replace(",", "").strip()
            total_revenue_int += int(clean_amount)
        except Exception:
            continue
    # Định dạng lại chuỗi hiển thị thành "xx,xxx,xxx đ"
    total_revenue_str = f"{total_revenue_int:,} đ"

    # 2. Đếm tổng số lượng đơn hàng hiện có trong hệ thống
    total_orders = session.exec(select(func.count(Order.id))).one()

    # 3. Tính tổng số lượng hàng tồn kho (stock) từ tất cả vật tư trong bảng Product
    # Nếu chưa có vật tư nào trong DB, mặc định lấy số kho mẫu ban đầu là 1,850
    total_stock = session.exec(select(func.sum(Product.stock))).one()
    if total_stock is None:
        # Nếu bảng Product trống, lấy số lượng từ data mẫu ban đầu
        total_stock = 45 + 650 + 25000

    # 4. Đếm số lượng nhà thầu/đối tác độc nhất (Unique) đã phát sinh đơn hàng
    distinct_customers = session.exec(
        select(func.count(func.distinct(Order.customer_name)))
    ).one()
    if distinct_customers == 0:
        distinct_customers = 5  # Mặc định theo danh sách khách hàng mẫu nếu chưa có đơn

    return {
        "total_revenue": total_revenue_str,
        "new_orders": f"{total_orders} đơn",
        "stock_count": f"{total_stock:,} Tấn/Viên/Bao",
        "customer_count": f"{distinct_customers} nhà thầu",
        "revenue_change": "+12.5%",  # Chỉ số xu hướng giữ tạm thời
    }


@app.get("/api/dashboard/chart")
def get_dashboard_chart(session: Session = Depends(get_session)):
    # 1. Lấy tất cả các đơn hàng hợp lệ đã hoàn thành (Completed) để tính doanh số thực tế
    orders = session.exec(select(Order).where(Order.status == "Completed")).all()

    # Sử dụng từ điển mặc định để gom nhóm doanh thu theo từng Tháng
    monthly_data_int = defaultdict(int)

    # 2. Quét qua từng đơn hàng để xử lý và bóc tách dữ liệu
    for order in orders:
        # Giả định dữ liệu đơn hàng cũ hoặc mới: nếu trường date là "Vừa xong" thì tính vào tháng hiện tại (Tháng 5)
        # Nếu hệ thống của bạn có lưu chuỗi dạng ngày tháng thực tế, bạn có thể bóc tách chuỗi ở đây.
        month_label = "Tháng 5"
        if order.date and "Tháng" in order.date:
            month_label = order.date  # Ví dụ: "Tháng 1", "Tháng 2" nếu có dữ liệu mẫu

        try:
            # Làm sạch chuỗi số tiền: loại bỏ " đ" và dấu phẩy "," để ép về kiểu số nguyên tính toán
            clean_amount = order.amount.replace(" đ", "").replace(",", "").strip()
            # Đổi đơn vị sang Triệu đồng (chia cho 1.000.000) để biểu đồ Recharts hiển thị gọn đẹp, không bị quá dài
            amount_in_millions = int(clean_amount) / 1000000

            monthly_data_int[month_label] += amount_in_millions
        except Exception:
            continue

    # 3. Định hình danh sách 5 tháng phân phối chuẩn để làm bộ khung biểu đồ (đảm bảo biểu đồ luôn mượt mà)
    # Nếu tháng nào chưa phát sinh đơn hàng, mặc định lấy số liệu phân phối mẫu nền ban đầu
    default_chart_structure = [
        {"name": "Tháng 1", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 1", 45)},
        {"name": "Tháng 2", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 2", 52)},
        {"name": "Tháng 3", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 3", 49)},
        {"name": "Tháng 4", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 4", 63)},
        {
            "name": "Tháng 5",
            "Doanh thu (Triệu)": monthly_data_int.get(
                "Tháng 5", 58 + monthly_data_int["Tháng 5"]
            ),
        },
    ]

    return default_chart_structure


@app.get("/api/dashboard/recent-orders")
def get_recent_orders(session: Session = Depends(get_session)):
    statement = select(Order).order_by(Order.id.desc())
    orders = session.exec(statement).all()
    return [
        {
            "id": f"ĐH-{o.id:03d}",
            "customer_name": o.customer_name,
            "product_name": o.product_name,
            "amount": o.amount,
            "status": o.status,
            "date": o.date,
        }
        for o in orders
    ]


# 1. Cập nhật Schema nhận dữ liệu từ Frontend (Thêm quantity)
class OrderCreate(BaseModel):
    customer_name: str
    product_name: str
    amount: str
    status: str
    quantity: int  # Số lượng vật tư nhà thầu đặt mua


# 2. Cập nhật API POST xử lý kiểm tra và tự động trừ kho hàng
@app.post(
    "/api/dashboard/orders"
)  # Đảm bảo viết chuẩn thế này, không có gạch chéo cuối cùng
def create_order(order_data: OrderCreate, session: Session = Depends(get_session)):
    statement = select(Product).where(Product.name == order_data.product_name.strip())
    product = session.exec(statement).first()

    if not product:
        raise HTTPException(
            status_code=400,  # Chuyển về 400 để phân biệt với lỗi 404 lỗi đường dẫn mạng
            detail=f"Vật tư '{order_data.product_name}' không tồn tại trong danh mục hệ thống!",
        )

    if product.stock < order_data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Kho không đủ hàng! Hiện tại '{product.name}' chỉ còn tồn {product.stock} sản phẩm.",
        )

    if order_data.status in ["Pending", "Completed"]:
        product.stock -= order_data.quantity
        session.add(product)

    new_order = Order(
        customer_name=order_data.customer_name,
        product_name=f"{product.name} (SL: {order_data.quantity})",
        amount=order_data.amount,
        status=order_data.status,
        date="Vừa xong",
    )

    session.add(new_order)
    session.commit()
    session.refresh(new_order)

    return {"message": "Tạo đơn và trừ kho thành công!", "order_id": new_order.id}


# 1. API cập nhật trạng thái đơn hàng (Sử dụng phương thức PATCH)
@app.patch("/api/dashboard/orders/{order_id}/status")
def update_order_status(
    order_id: int, status_data: dict, session: Session = Depends(get_session)
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Lấy trạng thái mới từ Frontend gửi lên (Completed, Pending, hoặc Cancelled)
    new_status = status_data.get("status")
    if new_status in ["Completed", "Pending", "Cancelled"]:
        order.status = new_status
        session.add(order)
        session.commit()
        return {"message": "Cập nhật trạng thái thành công"}
    else:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")


# 2. API xóa hoàn toàn đơn hàng khỏi Database (Sử dụng phương thức DELETE)
@app.delete("/api/dashboard/orders/{order_id}")
def delete_order(order_id: int, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    session.delete(order)
    session.commit()
    return {"message": "Xóa đơn hàng thành công"}


# Khai báo cấu trúc dữ liệu vật tư nhận từ Frontend
class ProductCreate(BaseModel):
    name: str
    category: str
    price: str
    stock: int
    image: str


# 1. API lấy danh sách vật tư từ Database đổ ra Frontend
@app.get("/api/dashboard/products")
def get_products(session: Session = Depends(get_session)):
    # Lấy toàn bộ sản phẩm trong DB, sắp xếp theo ID mới nhất lên đầu
    statement = select(Product).order_by(Product.id.desc())
    products = session.exec(statement).all()

    # Nếu DB chưa có sản phẩm nào, trả về danh sách mẫu ban đầu để giao diện không bị trống
    if len(products) == 0:
        return [
            {
                "id": 1,
                "name": "Thép cuộn Phi 6 Hòa Phát",
                "category": "Vật liệu thô",
                "price": "15,500,000 đ / Tấn",
                "stock": 45,
                "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=60",
            },
            {
                "id": 2,
                "name": "Xi măng Insee Đa Dụng PCB40",
                "category": "Vật liệu thô",
                "price": "88,000 đ / Bao",
                "stock": 650,
                "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=60",
            },
            {
                "id": 3,
                "name": "Gạch ống Tuynel 8x18",
                "category": "Vật liệu thô",
                "price": "1,200 đ / Viên",
                "stock": 25000,
                "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=150&auto=format&fit=crop&q=60",
            },
        ]

    return products


# 2. API tiếp nhận và lưu vật tư mới vào Database
# =================================================================
# NÂNG CẤP PHÂN HỆ VẬT TƯ / SẢN PHẨM (PRODUCTS CRUD)
# =================================================================


# 1. Schema định nghĩa cấu trúc dữ liệu gửi lên khi SỬA sản phẩm
class ProductUpdate(BaseModel):
    name: str
    category: str
    price: str
    stock: int


# API Sửa thông tin sản phẩm dựa theo ID
@app.put("/api/dashboard/products/{product_id}")
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy vật tư này trong hệ thống!"
        )

    # Ghi đè dữ liệu mới từ Frontend vào các cột trong Database
    product.name = product_data.name
    product.category = product_data.category
    product.price = product_data.price
    product.stock = product_data.stock

    session.add(product)
    session.commit()
    session.refresh(product)
    return {"message": "Cập nhật vật tư thành công!", "product": product}


# 2. API Xóa sản phẩm ra khỏi hệ thống dựa theo ID
@app.delete("/api/dashboard/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy vật tư này trong hệ thống!"
        )

    session.delete(product)
    session.commit()
    return {"message": f"Đã xóa vật tư '{product.name}' thành công!"}


# =================================================================
# PHÂN HỆ QUẢN LÝ KHÁCH HÀNG / NHÀ THẦU (CUSTOMERS)
# =================================================================


# Cập nhật lại API lấy danh sách nhà thầu kèm doanh số và hạng
@app.get("/api/dashboard/customers")
def get_customers(session: Session = Depends(get_session)):
    # 1. Lấy toàn bộ danh sách khách hàng
    statement = select(Customer)
    customers = session.exec(statement).all()

    result = []

    for customer in customers:
        # 2. Chạy lệnh SQL tính tổng tiền từ bảng Đơn hàng (Order) của nhà thầu này
        # Lọc các đơn hàng hợp lệ (Đã hoàn thành hoặc Đang xử lý, bỏ qua đơn Đã hủy)
        total_spent_statement = select(func.sum(Order.amount)).where(
            Order.customer_name == customer.name,
            Order.status.in_(["Completed", "Pending"]),
        )
        total_spent = session.exec(total_spent_statement).first() or 0

        # 3. Logic tự động xét duyệt Hạng Nhà Thầu dựa trên tổng tiền tích lũy
        if total_spent >= 50000000:
            rank = "Nhà thầu VVIP 👑"
            discount = "Chiết khấu 5%"
        elif total_spent >= 10000000:
            rank = "Nhà thầu Bạc 🥈"
            discount = "Chiết khấu 2%"
        else:
            rank = "Nhà thầu Đồng 🥉"
            discount = "Giá gốc"

        # 4. Đóng gói dữ liệu trả về cho Frontend
        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "tax_code": customer.tax_code,
                "status": customer.status,
                "total_spent": total_spent,  # Trả về số tiền tổng để Frontend định dạng tiền tệ
                "rank": rank,
                "discount": discount,
            }
        )

    return result


# 2. Schema nhận dữ liệu tạo nhà thầu mới từ Frontend
class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: str
    tax_code: str  # Mã số thuế nhà thầu


# API Thêm nhà thầu mới
@app.post("/api/dashboard/customers")
def create_customer(
    customer_data: CustomerCreate, session: Session = Depends(get_session)
):
    new_customer = Customer(
        name=customer_data.name,
        phone=customer_data.phone,
        address=customer_data.address,
        tax_code=customer_data.tax_code,
        status="Active",  # Mặc định hoạt động khi mới tạo
    )
    session.add(new_customer)
    session.commit()
    session.refresh(new_customer)
    return {"message": "Thêm nhà thầu thành công!", "customer": new_customer}


# 3. Schema nhận dữ liệu cập nhật thông tin nhà thầu
class CustomerUpdate(BaseModel):
    name: str
    phone: str
    address: str
    tax_code: str
    status: str


# API Cập nhật/Sửa thông tin nhà thầu
@app.put("/api/dashboard/customers/{customer_id}")
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    session: Session = Depends(get_session),
):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy thông tin nhà thầu!"
        )

    # Cập nhật các trường dữ liệu mới thay thế thông tin cũ
    customer.name = customer_data.name
    customer.phone = customer_data.phone
    customer.address = customer_data.address
    customer.tax_code = customer_data.tax_code
    customer.status = customer_data.status

    session.add(customer)
    session.commit()
    session.refresh(customer)
    return {"message": "Cập nhật thông tin thành công!", "customer": customer}


# 4. API Xóa nhà thầu khỏi hệ thống
@app.delete("/api/dashboard/customers/{customer_id}")
def delete_customer(customer_id: int, session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy thông tin nhà thầu!"
        )

    session.delete(customer)
    session.commit()
    return {"message": f"Đã xóa thành công nhà thầu '{customer.name}'"}


# =================================================================
# TÍNH NĂNG NHẬP KHO BỔ SUNG (QUICK RESTOCK)
# =================================================================


# Schema nhận số lượng cần cộng thêm từ Frontend
class RestockInput(BaseModel):
    quantity_to_add: int


# API PATCH để tăng số lượng tồn kho của một vật tư
@app.patch("/api/dashboard/products/{product_id}/restock")
def restock_product(
    product_id: int, input_data: RestockInput, session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy mã vật tư này!")

    if input_data.quantity_to_add <= 0:
        raise HTTPException(
            status_code=400, detail="Số lượng nhập kho bổ sung phải lớn hơn 0!"
        )

    # Tự động thực hiện phép toán cộng dồn trực tiếp trong Database
    product.stock += input_data.quantity_to_add

    session.add(product)
    session.commit()
    session.refresh(product)

    return {
        "message": f"Đã nhập thêm {input_data.quantity_to_add} đơn vị vào kho!",
        "new_stock": product.stock,
    }
