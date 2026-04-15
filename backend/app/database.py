import os

from motor.motor_asyncio import AsyncIOMotorClient

# Configuration de connexion MongoDB
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS, serverSelectionTimeoutMS=3000)
database = client.paramiq_db

mapping_collection = database.get_collection("mappings")
chat_collection = database.get_collection("chats")
users_collection = database.get_collection("users")
auth_sessions_collection = database.get_collection("auth_sessions")
validation_runs_collection = database.get_collection("validation_runs")
comparison_runs_collection = database.get_collection("comparison_runs")
pipeline_runs_collection = database.get_collection("pipeline_runs")
activity_events_collection = database.get_collection("activity_events")
generator_runs_collection = database.get_collection("generator_runs")
converter_runs_collection = database.get_collection("converter_runs")
