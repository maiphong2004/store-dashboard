from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from database import create_db_and_tables, get_session, Product, Customer, Order
from contextlib import asynccontextmanager
from database import engine 

app = FastAPI()

# Khởi tạo dữ liệu mẫu Vật liệu xây dựng nếu DB trống
def seed_data_if_empty(session: Session):
    if len(session.exec(select(Order)).all()) == 0:
        sample_orders = [
            Order(id=1, customer_name="Công ty Xây dựng Minh Đức", product_name="Thép cuộn Phi 6 Hòa Phát (1 Tấn)", amount="15,500,000 đ", status="Completed", date="10 phút trước"),
            Order(id=2, customer_name="Đại lý VLXD Tuấn Nghĩa", product_name="Xi măng Insee Đa Dụng (100 bao)", amount="8,800,000 đ", status="Pending", date="25 phút trước"),
            Order(id=3, customer_name="Thầu xây dựng Lê Hoàng", product_name="Gạch ống tuynel Bình Dương (10,000 viên)", amount="12,000,000 đ", status="Completed", date="1 giờ trước"),
            Order(id=4, customer_name="Cửa hàng điện nước Thành Phát", product_name="Dây cáp điện Cadivi 2.5mm (5 cuộn)", amount="3,750,000 đ", status="Cancelled", date="3 giờ trước"),
            Order(id=5, customer_name="Nhà thầu Nguyễn Quốc Anh", product_name="Cát tô xây dựng (4 khối)", amount="1,400,000 đ", status="Pending", date="Hôm qua"),
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
    total_orders_in_db = len(session.exec(select(Order)).all())
    return {
        "total_revenue": "41,450,000 đ",
        "new_orders": f"{total_orders_in_db} đơn",
        "stock_count": "1,850 Tấn/Viên",
        "customer_count": "42 nhà thầu",
        "revenue_change": "+18.2%"
    }

@app.get("/api/dashboard/chart")
def get_chart():
    return [
        {"name": "Tháng 1", "Doanh thu (Triệu)": 145.2, "Đơn hàng": 24},
        {"name": "Tháng 2", "Doanh thu (Triệu)": 185.8, "Đơn hàng": 32},
        {"name": "Tháng 3", "Doanh thu (Triệu)": 290.5, "Đơn hàng": 45},
        {"name": "Tháng 4", "Doanh thu (Triệu)": 210.1, "Đơn hàng": 38},
        {"name": "Tháng 5", "Doanh thu (Triệu)": 380.4, "Đơn hàng": 55},
        {"name": "Tháng 6", "Doanh thu (Triệu)": 415.2, "Đơn hàng": 68},
    ]

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
            "date": o.date
        } for o in orders
    ]