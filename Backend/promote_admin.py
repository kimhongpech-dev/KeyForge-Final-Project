import asyncio
import os
import sys

import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()


async def promote(email: str) -> None:
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client.get_default_database()

    result = await db.users.update_one(
        {"email": email.strip().lower()}, {"$set": {"role": "admin"}}
    )
    if result.matched_count == 0:
        print(f"User '{email}' not found. Sign up first, then run this again.")
    else:
        print(f"User '{email}' is now an admin.")

    client.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <email>")
        sys.exit(1)
    asyncio.run(promote(sys.argv[1]))
