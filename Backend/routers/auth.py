from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..database import db
from ..schemas import AuthRequest, AuthResponse
from ..security import create_token, get_current_user, hash_password, verify_password

router = APIRouter()


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(body: AuthRequest) -> AuthResponse:
    email = body.email.strip().lower()
    if not email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = hash_password(body.password)
    result = await db.users.insert_one(
        {"email": email, "password": hashed, "role": "user"}
    )
    token = create_token(result.inserted_id)

    return AuthResponse(token=token, user={"email": email, "role": "user"})


@router.post("/login", response_model=AuthResponse)
async def login(body: AuthRequest) -> AuthResponse:
    email = body.email.strip().lower()
    if not email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_token(user["_id"])

    return AuthResponse(
        token=token, user={"email": user["email"], "role": user.get("role", "user")}
    )


@router.get("/me")
async def me(user_id: str = Depends(get_current_user)) -> dict:
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1, "role": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": {"email": user["email"], "role": user.get("role", "user")}}
