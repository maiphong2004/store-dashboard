from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from database import create_db_and_tables, get_session, Product, Customer, Order
from contextlib import asynccontextmanager
from database import engine
from pydantic import BaseModel
from collections import defaultdict


# Khai báo dữ liệu mẫu nếu DB trống
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


# Khởi tạo một thực thể FastAPI duy nhất kèm lifespan
app = FastAPI(title="Store Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# PHÂN HỆ DASHBOARD STATS & CHARTS
# =================================================================


@app.get("/api/dashboard/stats")
def get_stats(session: Session = Depends(get_session)):
    completed_orders = session.exec(
        select(Order).where(Order.status == "Completed")
    ).all()
    total_revenue_int = 0
    for order in completed_orders:
        try:
            clean_amount = order.amount.replace(" đ", "").replace(",", "").strip()
            total_revenue_int += int(clean_amount)
        except Exception:
            continue
    total_revenue_str = f"{total_revenue_int:,} đ"

    total_orders = session.exec(select(func.count(Order.id))).one()

    total_stock = session.exec(select(func.sum(Product.stock))).one()
    if total_stock is None:
        total_stock = 45 + 650 + 25000

    distinct_customers = session.exec(
        select(func.count(func.distinct(Order.customer_name)))
    ).one()
    if distinct_customers == 0:
        distinct_customers = 5

    return {
        "total_revenue": total_revenue_str,
        "new_orders": f"{total_orders} đơn",
        "stock_count": f"{total_stock:,} Tấn/Viên/Bao",
        "customer_count": f"{distinct_customers} nhà thầu",
        "revenue_change": "+12.5%",
    }


@app.get("/api/dashboard/chart")
def get_dashboard_chart(session: Session = Depends(get_session)):
    orders = session.exec(select(Order).where(Order.status == "Completed")).all()
    monthly_data_int = defaultdict(int)

    for order in orders:
        month_label = "Tháng 5"
        if order.date and "Tháng" in order.date:
            month_label = order.date

        try:
            clean_amount = order.amount.replace(" đ", "").replace(",", "").strip()
            amount_in_millions = int(clean_amount) / 1000000
            monthly_data_int[month_label] += amount_in_millions
        except Exception:
            continue

    default_chart_structure = [
        {"name": "Tháng 1", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 1", 45)},
        {"name": "Tháng 2", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 2", 52)},
        {"name": "Tháng 3", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 3", 49)},
        {"name": "Tháng 4", "Doanh thu (Triệu)": monthly_data_int.get("Tháng 4", 63)},
        {
            "name": "Tháng 5",
            "Doanh thu (Triệu)": monthly_data_int.get("Tháng 5", 58)
            + monthly_data_int["Tháng 5"],
        },
    ]
    return default_chart_structure


# =================================================================
# PHÂN HỆ QUẢN LÝ ĐƠN HÀNG (ORDERS)
# =================================================================


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


class OrderCreate(BaseModel):
    customer_name: str
    product_name: str
    amount: str
    status: str
    quantity: int


@app.post("/api/dashboard/orders")
def create_order(order_data: OrderCreate, session: Session = Depends(get_session)):
    # ĐÃ SỬA: Sử dụng đúng biến làm sạch để tìm kiếm tên sản phẩm tương đồng
    clean_name = order_data.product_name.strip()
    product = session.exec(
        select(Product).where(Product.name.like(f"%{clean_name}%"))
    ).first()

    if not product:
        raise HTTPException(
            status_code=400,
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


@app.patch("/api/dashboard/orders/{order_id}/status")
def update_order_status(
    order_id: int, status_data: dict, session: Session = Depends(get_session)
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    new_status = status_data.get("status")
    if new_status in ["Completed", "Pending", "Cancelled"]:
        order.status = new_status
        session.add(order)
        session.commit()
        return {"message": "Cập nhật trạng thái thành công"}
    else:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")


@app.delete("/api/dashboard/orders/{order_id}")
def delete_order(order_id: int, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    session.delete(order)
    session.commit()
    return {"message": "Xóa đơn hàng thành công"}


# =================================================================
# PHÂN HỆ VẬT TƯ / SẢN PHẨM (PRODUCTS)
# =================================================================


class ProductCreate(BaseModel):
    name: str
    category: str
    price: str
    stock: int
    image: str


class ProductUpdate(BaseModel):
    name: str
    category: str
    price: str
    stock: int


@app.get("/api/dashboard/products", response_model=None)
def get_products(session: Session = Depends(get_session)):
    statement = select(Product).order_by(Product.id.desc())
    products = session.exec(statement).all()

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


@app.put("/api/dashboard/products/{product_id}")
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy vật tư này!")

    product.name = product_data.name
    product.category = product_data.category
    product.price = product_data.price
    product.stock = product_data.stock

    session.add(product)
    session.commit()
    session.refresh(product)
    return {"message": "Cập nhật thành công!", "product": product}


@app.delete("/api/dashboard/products/{product_id}", response_model=None)
def delete_product(product_id: str, session: Session = Depends(get_session)):
    # Xử lý ID an toàn: chuyển sang int nếu được, không thì giữ nguyên chuỗi
    try:
        target_id = int(product_id)
    except ValueError:
        target_id = product_id

    # Tìm sản phẩm trong DB
    product = session.get(Product, target_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy vật tư có ID {product_id} trong hệ thống!",
        )

    # Xóa sản phẩm
    session.delete(product)
    session.commit()

    return {"status": "success", "message": "Đã xóa vật tư thành công!"}


@app.patch("/api/dashboard/products/{product_id}/restock")
def restock_product(
    product_id: int, input_data: dict, session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy mã vật tư này!")

    qty = input_data.get("quantity_to_add", 0)
    if qty <= 0:
        raise HTTPException(
            status_code=400, detail="Số lượng nhập kho bổ sung phải lớn hơn 0!"
        )

    product.stock += qty
    session.add(product)
    session.commit()
    session.refresh(product)
    return {
        "message": f"Đã nhập thêm {qty} đơn vị vào kho!",
        "new_stock": product.stock,
    }


# =================================================================
# PHÂN HỆ QUẢN LÝ KHÁCH HÀNG / NHÀ THẦU (CUSTOMERS)
# =================================================================


@app.get("/api/dashboard/customers")
def get_customers(session: Session = Depends(get_session)):
    customers = session.exec(select(Customer)).all()
    result = []

    for customer in customers:
        # ĐÃ SỬA: Lấy danh sách các đơn hàng hợp lệ để tính toán chuỗi thủ công, tránh lỗi SQL sum trên cột String
        orders_statement = select(Order).where(
            Order.customer_name == customer.name,
            Order.status.in_(["Completed", "Pending"]),
        )
        user_orders = session.exec(orders_statement).all()

        total_spent = 0
        for o in user_orders:
            try:
                clean_amount = o.amount.replace(" đ", "").replace(",", "").strip()
                total_spent += int(clean_amount)
            except:
                continue

        if total_spent >= 50000000:
            rank = "Nhà thầu VVIP 👑"
            discount = "Chiết khấu 5%"
        elif total_spent >= 10000000:
            rank = "Nhà thầu Bạc 🥈"
            discount = "Chiết khấu 2%"
        else:
            rank = "Nhà thầu Đồng 🥉"
            discount = "Giá gốc"

        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "tax_code": customer.tax_code,
                "status": customer.status,
                "total_spent": total_spent,
                "rank": rank,
                "discount": discount,
            }
        )
    return result


class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: str
    tax_code: str


class CustomerUpdate(BaseModel):
    name: str
    phone: str
    address: str
    tax_code: str
    status: str


@app.post("/api/dashboard/customers")
def create_customer(
    customer_data: CustomerCreate, session: Session = Depends(get_session)
):
    new_customer = Customer(
        name=customer_data.name,
        phone=customer_data.phone,
        address=customer_data.address,
        tax_code=customer_data.tax_code,
        status="Active",
    )
    session.add(new_customer)
    session.commit()
    session.refresh(new_customer)
    return {"message": "Thêm nhà thầu thành công!", "customer": new_customer}


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

    customer.name = customer_data.name
    customer.phone = customer_data.phone
    customer.address = customer_data.address
    customer.tax_code = customer_data.tax_code
    customer.status = customer_data.status

    session.add(customer)
    session.commit()
    session.refresh(customer)
    return {"message": "Cập nhật thông tin thành công!", "customer": customer}


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
