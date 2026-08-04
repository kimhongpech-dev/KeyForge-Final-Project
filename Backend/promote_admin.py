import asyncio
import sys

from .database import client, db


async def promote(email: str) -> None:
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
        print("Usage: python -m Backend.promote_admin <email>")
        sys.exit(1)
    asyncio.run(promote(sys.argv[1]))
