from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..database import db
from ..schemas import OrderCreate
from ..security import get_current_user
from ..utils import adjust_stock, serialize_order

router = APIRouter()

CANCELLABLE_STATUSES = ("pending", "confirmed")


@router.post("", status_code=201)
async def create_order(
    body: OrderCreate, user_id: str = Depends(get_current_user)
) -> dict:
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items = []
    total = 0.0
    for item in body.items:
        product = await db.products.find_one(
            {"id": item.productId, "stock": {"$gte": item.quantity}}
        )
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {item.productId}",
            )
        items.append(
            {
                "productId": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "image": product.get("image", ""),
            }
        )
        total += product["price"] * item.quantity

    await adjust_stock(items, -1)

    now = datetime.now(timezone.utc)
    order = {
        "userId": ObjectId(user_id),
        "items": items,
        "total": round(total, 2),
        "status": "pending",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.orders.insert_one(order)
    order["_id"] = result.inserted_id
    return serialize_order(order)


@router.post("/{order_id}/cancel", status_code=204)
async def cancel_order(order_id: str, user_id: str = Depends(get_current_user)) -> None:
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")

    order = await db.orders.find_one({"_id": oid, "userId": ObjectId(user_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] not in CANCELLABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="This order can no longer be cancelled",
        )

    await adjust_stock(order["items"], 1)
    await db.orders.delete_one({"_id": oid})


@router.get("")
async def list_orders(user_id: str = Depends(get_current_user)):
    cursor = db.orders.find({"userId": ObjectId(user_id)}).sort("createdAt", -1)
    return [serialize_order(doc) async for doc in cursor]
