from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product_name: str = ""

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str = ""
    status: OrderStatus
    total_amount: float
    created_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
