from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..database import db
from ..schemas import SUPPORT_STATUSES, SupportConversationUpsert
from ..security import get_current_admin

router = APIRouter()

COLLECTION = "support_conversations"
MAX_MESSAGES = 2000


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = doc.pop("_id")
    return doc


async def find_conv(conversation_id: str) -> dict:
    doc = await db[COLLECTION].find_one({"_id": conversation_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return doc


@router.post("/conversations/upsert")
async def upsert_conversation(body: SupportConversationUpsert) -> dict:
    conversation_id = body.id.strip()
    if not conversation_id or len(conversation_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid conversation id")
    if not body.customerId or len(body.customerId) > 200:
        raise HTTPException(status_code=400, detail="Invalid customer id")

    incoming = body.messages[:MAX_MESSAGES]
    existing = await db[COLLECTION].find_one({"_id": conversation_id})

    if existing:
        known = {m["id"] for m in existing.get("messages", [])}
        added = [m for m in incoming if m.id not in known]
        merged = {m["id"]: m for m in existing.get("messages", [])}
        for message in incoming:
            merged[message.id] = message.model_dump()
        messages = list(merged.values())
        unread_admin = existing.get("unreadForAdmin", 0) + sum(
            1 for m in added if m.senderType == "customer"
        )
        unread_customer = existing.get("unreadForCustomer", 0) + sum(
            1 for m in added if m.senderType == "admin"
        )
        timestamps = [existing.get("updatedAt", ""), body.updatedAt or ""]
        timestamps.extend(m.createdAt for m in added)
        updated_at = max(timestamps)
        update = {
            "$set": {
                "customerName": body.customerName or existing.get("customerName", ""),
                "customerEmail": body.customerEmail or existing.get("customerEmail", ""),
                "customerPhone": body.customerPhone or existing.get("customerPhone", ""),
                "messages": messages,
                "unreadForAdmin": unread_admin,
                "unreadForCustomer": unread_customer,
                "updatedAt": updated_at,
            }
        }
        if body.status in SUPPORT_STATUSES:
            update["$set"]["status"] = body.status
        await db[COLLECTION].update_one({"_id": conversation_id}, update)
    else:
        now = now_iso()
        doc = {
            "_id": conversation_id,
            "customerId": body.customerId,
            "customerName": body.customerName,
            "customerEmail": body.customerEmail,
            "customerPhone": body.customerPhone,
            "status": body.status if body.status in SUPPORT_STATUSES else "new",
            "messages": [m.model_dump() for m in incoming],
            "unreadForAdmin": sum(1 for m in incoming if m.senderType == "customer"),
            "unreadForCustomer": sum(1 for m in incoming if m.senderType == "admin"),
            "createdAt": body.createdAt or now,
            "updatedAt": body.updatedAt or now,
        }
        await db[COLLECTION].insert_one(doc)

    return serialize(await find_conv(conversation_id))


@router.get("/conversations/mine")
async def my_conversations(customerId: str) -> dict:
    if not customerId or len(customerId) > 200:
        raise HTTPException(status_code=400, detail="Invalid customer id")
    docs = (
        await db[COLLECTION]
        .find({"customerId": customerId})
        .sort("updatedAt", -1)
        .to_list(500)
    )
    return {"conversations": [serialize(doc) for doc in docs]}


@router.get("/conversations")
async def list_all_conversations(_: str = Depends(get_current_admin)) -> dict:
    docs = await db[COLLECTION].find().sort("updatedAt", -1).to_list(500)
    return {"conversations": [serialize(doc) for doc in docs]}


@router.post("/conversations/{conversation_id}/mark-read")
async def mark_conversation_read(conversation_id: str, who: str) -> dict:
    if who not in ("admin", "customer"):
        raise HTTPException(status_code=400, detail="Invalid 'who' value")
    await find_conv(conversation_id)
    field = "unreadForAdmin" if who == "admin" else "unreadForCustomer"
    await db[COLLECTION].update_one({"_id": conversation_id}, {"$set": {field: 0}})
    return serialize(await find_conv(conversation_id))


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str, _: str = Depends(get_current_admin)
) -> None:
    await db[COLLECTION].delete_one({"_id": conversation_id})
