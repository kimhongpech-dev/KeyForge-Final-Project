import asyncio
import json
from pathlib import Path

from .database import client, db


async def seed() -> None:
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
