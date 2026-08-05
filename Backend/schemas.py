from typing import Literal

from pydantic import BaseModel, Field

ORDER_STATUSES = ("pending", "confirmed", "shipped", "delivered", "cancelled")


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class OrderItem(BaseModel):
    productId: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    items: list[OrderItem]


class ProductCreate(BaseModel):
    id: int | None = None
    name: str
    price: float = Field(ge=0)
    image: str = ""
    description: str = ""
    category: str = ""
    stock: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = Field(default=None, ge=0)
    image: str | None = None
    description: str | None = None
    category: str | None = None
    stock: int | None = Field(default=None, ge=0)


class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]


SUPPORT_STATUSES = ("new", "open", "waiting", "resolved", "closed")


class SupportMessage(BaseModel):
    id: str
    senderType: Literal["customer", "admin"]
    content: str
    createdAt: str
    image: str | None = None
    senderId: str | None = None
    status: str | None = None


class SupportConversationUpsert(BaseModel):
    id: str
    customerId: str
    customerName: str = ""
    customerEmail: str = ""
    customerPhone: str = ""
    status: Literal["new", "open", "waiting", "resolved", "closed"] = "new"
    messages: list[SupportMessage] = []
    createdAt: str | None = None
    updatedAt: str | None = None
