from .database import db


def serialize_product(doc: dict) -> dict:
    result = {key: value for key, value in doc.items() if key != "_id"}
    result.setdefault("stock", 0)
    return result


def serialize_order(doc: dict, user_email: str | None = None) -> dict:
    result = {key: value for key, value in doc.items() if key != "_id"}
    result["id"] = str(doc["_id"])
    result["userId"] = str(doc["userId"])
    result["userEmail"] = user_email
    return result


async def adjust_stock(items: list[dict], delta: int) -> None:
    for item in items:
        await db.products.update_one(
            {"id": item["productId"]}, {"$inc": {"stock": delta * item["quantity"]}}
        )
