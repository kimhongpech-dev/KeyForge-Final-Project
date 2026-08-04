import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client.get_default_database()
