from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..database import db
from ..schemas import OrderStatusUpdate, ProductCreate, ProductUpdate
from ..security import get_current_admin
from .orders import adjust_stock
from .products import serialize_product

router = APIRouter()

STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"]


def serialize_order(doc: dict, user_email: str | None) -> dict:
    doc["id"] = str(doc["_id"])
    doc["userId"] = str(doc["userId"])
    doc["userEmail"] = user_email
    return {key: value for key, value in doc.items() if key != "_id"}


@router.get("/products")
async def list_all_products(_: str = Depends(get_current_admin)):
    cursor = db.products.find({}).sort("id", 1)
    return [serialize_product(doc) async for doc in cursor]


@router.post("/products", status_code=201)
async def create_product(body: ProductCreate, _: str = Depends(get_current_admin)):
    existing = await db.products.find_one({"name": body.name})
    if existing:
        raise HTTPException(status_code=400, detail="A product with this name already exists")

    if body.id is None:
        last = await db.products.find_one({}, {"id": 1}, sort=[("id", -1)])
        product_id = (last["id"] + 1) if last else 1
    else:
        product_id = body.id
        duplicate = await db.products.find_one({"id": product_id})
        if duplicate:
            raise HTTPException(status_code=400, detail="A product with this id already exists")

    product = {
        "id": product_id,
        "name": body.name,
        "price": body.price,
        "image": body.image,
        "description": body.description,
        "category": body.category,
        "stock": body.stock,
    }
    result = await db.products.insert_one(product)
    product["_id"] = result.inserted_id
    return serialize_product(product)


@router.put("/products/{product_id}")
async def update_product(
    product_id: int, body: ProductUpdate, _: str = Depends(get_current_admin)
):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.products.update_one({"id": product_id}, {"$set": updates})
    updated = await db.products.find_one({"id": product_id})
    return serialize_product(updated)


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, _: str = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("/orders")
async def list_all_orders(_: str = Depends(get_current_admin)):
    orders = []
    async for order in db.orders.find({}).sort("createdAt", -1):
        user = await db.users.find_one({"_id": order["userId"]}, {"email": 1})
        orders.append(serialize_order(order, user["email"] if user else None))
    return orders


@router.get("/stats")
async def get_stats(_: str = Depends(get_current_admin)) -> dict:
    today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    start_of_range = today - timedelta(days=13)
    active = {"status": {"$ne": "cancelled"}}

    revenue_rows = await db.orders.aggregate(
        [
            {
                "$match": {
                    "createdAt": {"$gte": start_of_range},
                    "status": {"$ne": "cancelled"},
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                    "total": {"$sum": "$total"},
                }
            },
        ]
    ).to_list(length=100)
    revenue_by_date = {row["_id"]: round(row["total"], 2) for row in revenue_rows}

    revenue = []
    for i in range(14):
        day = start_of_range + timedelta(days=i)
        key = day.strftime("%Y-%m-%d")
        revenue.append(
            {
                "date": key,
                "weekday": day.strftime("%a"),
                "total": revenue_by_date.get(key, 0),
            }
        )

    status_rows = await db.orders.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ).to_list(length=100)
    status_counts = {row["_id"]: row["count"] for row in status_rows}
    orders_by_status = [
        {"status": status, "count": status_counts.get(status, 0)}
        for status in STATUS_ORDER
    ]

    top_rows = await db.orders.aggregate(
        [
            {"$match": active},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.productId",
                    "name": {"$first": "$items.name"},
                    "quantity": {"$sum": "$items.quantity"},
                    "revenue": {
                        "$sum": {"$multiply": ["$items.price", "$items.quantity"]}
                    },
                }
            },
            {"$sort": {"quantity": -1}},
            {"$limit": 5},
        ]
    ).to_list(length=5)
    top_products = [
        {
            "name": row["name"],
            "quantity": row["quantity"],
            "revenue": round(row["revenue"], 2),
        }
        for row in top_rows
    ]

    category_rows = await db.products.aggregate(
        [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    ).to_list(length=100)
    category_split = [
        {
            "category": row["_id"] or "Uncategorized",
            "count": row["count"],
        }
        for row in sorted(category_rows, key=lambda r: r["count"], reverse=True)
    ]

    return {
        "revenue": revenue,
        "ordersByStatus": orders_by_status,
        "topProducts": top_products,
        "categorySplit": category_split,
    }


@router.put("/orders/{order_id}")
async def update_order_status(
    order_id: str, body: OrderStatusUpdate, _: str = Depends(get_current_admin)
):
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")

    order = await db.orders.find_one({"_id": oid})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    previous = order["status"]
    await db.orders.update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "updatedAt": datetime.now(timezone.utc)}},
    )

    if previous != body.status:
        if body.status == "cancelled":
            await adjust_stock(order["items"], 1)
        elif previous == "cancelled":
            await adjust_stock(order["items"], -1)

    order["status"] = body.status
    user = await db.users.find_one({"_id": order["userId"]}, {"email": 1})
    return serialize_order(order, user["email"] if user else None)
