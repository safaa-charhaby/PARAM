import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def seed_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.paramiq_db
    collection = db.get_collection("mappings")
    
    # Check if mappings exist
    count = await collection.count_documents({})
    if count > 0:
        print(f"Database contains {count} mappings. Dropping for seed...")
        await collection.drop()

    dummy_mappings = [
        {"oldConcept": "CAL:x13", "newConcept": "qAAA:qCM", "similarity": 0.94, "status": "Auto-Accept"},
        {"oldConcept": "CPS:x5", "newConcept": "qBBF:qSR", "similarity": 0.68, "status": "Pending"},
        {"oldConcept": "AS:y99", "newConcept": "qFI:qCG", "similarity": 0.23, "status": "Rejected"},
        {"oldConcept": "FINREP:x1", "newConcept": "qZXX:qCM", "similarity": 0.88, "status": "Pending"},
        {"oldConcept": "COREP:x2", "newConcept": "qZZZ:qSR", "similarity": 0.45, "status": "Pending"}
    ]
    
    result = await collection.insert_many(dummy_mappings)
    print(f"Succefully inserted {len(result.inserted_ids)} mappings.")

if __name__ == "__main__":
    asyncio.run(seed_db())
