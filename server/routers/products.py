import re

from fastapi import APIRouter, HTTPException

from ..database import db

router = APIRouter()


def serialize_product(doc: dict) -> dict:
    result = {key: value for key, value in doc.items() if key != "_id"}
    result.setdefault("stock", 0)
    return result


@router.get("")
async def list_products(search: str | None = None, category: str | None = None):
    filter_query = {}
    if search:
        regex = {"$regex": re.escape(search), "$options": "i"}
        filter_query["$or"] = [{"name": regex}, {"description": regex}]
    if category:
        filter_query["category"] = category

    cursor = db.products.find(filter_query).sort("id", 1)
    products = [serialize_product(doc) async for doc in cursor]
    return products


@router.get("/categories")
async def list_categories():
    categories = await db.products.distinct("category")
    return sorted(c for c in categories if c)


@router.get("/{product_id}")
async def get_product(product_id: int):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)
