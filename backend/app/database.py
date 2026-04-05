from motor.motor_asyncio import AsyncIOMotorClient

# Configuration de connexion MongoDB
MONGO_DETAILS = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.paramiq_db

mapping_collection = database.get_collection("mappings")
chat_collection = database.get_collection("chats")
