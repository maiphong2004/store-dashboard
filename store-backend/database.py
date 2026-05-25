from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, create_engine, Session, Relationship

# 1. Cấu hình file database SQLite (Nó sẽ tự sinh ra một file tên là store.db)
sqlite_file_name = "store.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False} # Dành riêng cho SQLite
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

# 2. Định nghĩa Bảng Sản Phẩm
class Product(SQLModel, table=True):
    __tablename__ = "products"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    sku: str = Field(unique=True, index=True)
    price: float
    stock: int
    category: str

# 3. Định nghĩa Bảng Khách Hàng
class Customer(SQLModel, table=True):
    __tablename__ = "customers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    phone: str = Field(unique=True, index=True)
    email: Optional[str] = None

# 4. Định nghĩa Bảng Đơn Hàng
class Order(SQLModel, table=True):
    __tablename__ = "orders"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str # Để đơn giản ban đầu, ta lưu trực tiếp tên khách vào đơn
    product_name: str  # Tên sản phẩm chính trong đơn
    amount: str        # Số tiền định dạng chuỗi (VD: "250,000 đ")
    status: str        # Completed, Pending, Cancelled
    date: str          # Thời gian mua (VD: "10 phút trước", "Hôm nay")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Hàm khởi tạo database (Tự động tạo file .db và các bảng nếu chưa có)
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Hàm tiện ích để lấy Session kết nối DB
def get_session():
    with Session(engine) as session:
        yield session