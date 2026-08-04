import asyncio
import json
import os
from pathlib import Path

import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()


async def seed() -> None:
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client.get_default_database()

    products = json.loads(
        (Path(__file__).parent / "seed_products.json").read_text(encoding="utf-8")
    )

    result = await db.products.delete_many({})
    print(f"Cleared {result.deleted_count} existing products")

    await db.products.insert_many(products)
    print(f"Seeded {len(products)} products")

    client.close()
    print("Done")


if __name__ == "__main__":
    asyncio.run(seed())
