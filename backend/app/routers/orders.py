from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


def build_order_response(order: Order) -> OrderResponse:
    items = []
    for item in order.order_items:
        items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=item.product.name if item.product else "",
        ))
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else "",
        status=order.status,
        total_amount=order.total_amount,
        created_at=order.created_at,
        order_items=items,
    )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    resolved_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        resolved_items.append((product, item.quantity))
        total_amount += product.price * item.quantity

    order = Order(customer_id=order_data.customer_id, total_amount=total_amount, status=OrderStatus.pending)
    db.add(order)
    db.flush()

    for product, qty in resolved_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
        )
        db.add(order_item)
        product.quantity -= qty

    db.commit()
    db.refresh(order)

    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.order_items).joinedload(OrderItem.product))
        .filter(Order.id == order.id)
        .first()
    )
    return build_order_response(order)


@router.get("/", response_model=List[OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.order_items).joinedload(OrderItem.product))
        .offset(skip).limit(limit).all()
    )
    return [build_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.order_items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return build_order_response(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.order_items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock when cancelling
    for item in order.order_items:
        if item.product:
            item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
