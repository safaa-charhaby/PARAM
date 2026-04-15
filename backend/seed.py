import argparse
import asyncio
import hashlib
import os
from datetime import datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorClient


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


async def seed_db(reset: bool = False):
    mongo_details = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_details, serverSelectionTimeoutMS=4000)
    db = client.paramiq_db

    collections = {
        "users": db.get_collection("users"),
        "auth_sessions": db.get_collection("auth_sessions"),
        "mappings": db.get_collection("mappings"),
        "validation_runs": db.get_collection("validation_runs"),
        "comparison_runs": db.get_collection("comparison_runs"),
        "pipeline_runs": db.get_collection("pipeline_runs"),
        "activity_events": db.get_collection("activity_events"),
        "generator_runs": db.get_collection("generator_runs"),
        "converter_runs": db.get_collection("converter_runs"),
    }

    if reset:
        print("[seed] reset demandé, nettoyage des collections...")
        for name, collection in collections.items():
            await collection.delete_many({})
            print(f"[seed] - {name}: vidé")

    now = utc_now()

    # Users (auth)
    admin_email = "admin@paramiq.local"
    analyst_email = "analyst@paramiq.local"
    existing_admin = await collections["users"].find_one({"email": admin_email})
    existing_analyst = await collections["users"].find_one({"email": analyst_email})

    if not existing_admin:
        await collections["users"].insert_one(
            {
                "name": "Admin ParamIQ",
                "email": admin_email,
                "role": "admin",
                "is_active": True,
                "password_hash": hash_password("Admin123!"),
                "created_at": now,
            }
        )
        print("[seed] user admin créé: admin@paramiq.local / Admin123!")
    else:
        print("[seed] user admin déjà présent")

    if not existing_analyst:
        await collections["users"].insert_one(
            {
                "name": "Analyst ParamIQ",
                "email": analyst_email,
                "role": "analyst",
                "is_active": True,
                "password_hash": hash_password("Analyst123!"),
                "created_at": now,
            }
        )
        print("[seed] user analyst créé: analyst@paramiq.local / Analyst123!")
    else:
        print("[seed] user analyst déjà présent")

    # Mappings
    if await collections["mappings"].count_documents({}) == 0:
        await collections["mappings"].insert_many(
            [
                {"oldConcept": "CAL:x13", "newConcept": "qAAA:qCM", "similarity": 0.94, "status": "Auto-Accept"},
                {"oldConcept": "CPS:x5", "newConcept": "qBBF:qSR", "similarity": 0.68, "status": "Pending"},
                {"oldConcept": "AS:y99", "newConcept": "qFI:qCG", "similarity": 0.23, "status": "Rejected"},
                {"oldConcept": "FINREP:x1", "newConcept": "qZXX:qCM", "similarity": 0.88, "status": "Pending"},
                {"oldConcept": "COREP:x2", "newConcept": "qZZZ:qSR", "similarity": 0.45, "status": "Pending"},
            ]
        )
        print("[seed] mappings insérés")
    else:
        print("[seed] mappings déjà présents")

    # Validation runs (Dashboard)
    if await collections["validation_runs"].count_documents({}) == 0:
        validation_docs = []
        for i in range(1, 7):
            created_at = now - timedelta(days=(7 - i) * 2)
            score = 82 + i
            critique_cnt = 1 if i % 3 == 0 else 0
            warn_cnt = 2 if i % 2 == 0 else 1
            validation_docs.append(
                {
                    "file_name": f"reporting_week_{i}.csv",
                    "score": score,
                    "total_lines": 120 + i * 4,
                    "critique_cnt": critique_cnt,
                    "warn_cnt": warn_cnt,
                    "issues_total": critique_cnt + warn_cnt,
                    "issues": [],
                    "analysis_summary": {
                        "rows_total": 120 + i * 4,
                        "business_violations_count": critique_cnt,
                        "valid_rare_count": warn_cnt,
                    },
                    "created_at": created_at,
                }
            )
        await collections["validation_runs"].insert_many(validation_docs)
        print("[seed] validation_runs insérés")
    else:
        print("[seed] validation_runs déjà présents")

    # Pipeline runs
    if await collections["pipeline_runs"].count_documents({}) == 0:
        await collections["pipeline_runs"].insert_many(
            [
                {
                    "task_name": "Instance ParamIQ SBS",
                    "branch": "main",
                    "status": "success",
                    "commit": "a8f2e91",
                    "created_at": now - timedelta(hours=5),
                    "completed_at": now - timedelta(hours=5, minutes=-2),
                    "logs": ["Init", "Checks", "Done"],
                },
                {
                    "task_name": "Taxonomy refresh",
                    "branch": "main",
                    "status": "running",
                    "commit": "b9cd102",
                    "created_at": now - timedelta(minutes=35),
                    "logs": ["Init", "Downloading refs"],
                },
            ]
        )
        print("[seed] pipeline_runs insérés")
    else:
        print("[seed] pipeline_runs déjà présents")

    # Generator runs
    if await collections["generator_runs"].count_documents({}) == 0:
        await collections["generator_runs"].insert_one(
            {
                "form_name": "Formulaire_finrep_q1",
                "source_file": "finrep_q1.csv",
                "fields_total": 18,
                "fields": [
                    {
                        "name": "ifrs:Assets",
                        "label": "Assets",
                        "datatype": "number",
                        "required": True,
                        "placeholder": "0.00",
                    },
                    {
                        "name": "ifrs:Liabilities",
                        "label": "Liabilities",
                        "datatype": "number",
                        "required": True,
                        "placeholder": "0.00",
                    },
                ],
                "created_at": now - timedelta(hours=9),
            }
        )
        print("[seed] generator_runs insérés")
    else:
        print("[seed] generator_runs déjà présents")

    # Converter runs
    if await collections["converter_runs"].count_documents({}) == 0:
        await collections["converter_runs"].insert_one(
            {
                "source_file": "espf_extract_2026_03.xlsx",
                "rows_total": 245,
                "columns": ["concept", "value_raw", "value_num", "context_ref", "unit_ref", "decimals"],
                "created_at": now - timedelta(hours=8),
            }
        )
        print("[seed] converter_runs insérés")
    else:
        print("[seed] converter_runs déjà présents")

    # Comparison runs
    if await collections["comparison_runs"].count_documents({}) == 0:
        await collections["comparison_runs"].insert_one(
            {
                "file_a_name": "report_v1.csv",
                "file_b_name": "report_v2.csv",
                "summary": {
                    "similarity": 92.0,
                    "added_count": 4,
                    "removed_count": 2,
                    "changed_count": 7,
                    "same_count": 80,
                    "total_rows": 93,
                },
                "rows": [],
                "created_at": now - timedelta(hours=4),
            }
        )
        print("[seed] comparison_runs insérés")
    else:
        print("[seed] comparison_runs déjà présents")

    # Activity feed
    if await collections["activity_events"].count_documents({}) == 0:
        await collections["activity_events"].insert_many(
            [
                {
                    "event_type": "validation",
                    "title": "Validation: reporting_week_6.csv",
                    "payload": {"score": 88, "critique_cnt": 0, "warn_cnt": 2},
                    "created_at": now - timedelta(minutes=15),
                },
                {
                    "event_type": "comparison",
                    "title": "Comparaison: report_v1.csv vs report_v2.csv",
                    "payload": {"changed_count": 7},
                    "created_at": now - timedelta(hours=1),
                },
                {
                    "event_type": "pipeline_run",
                    "title": "Pipeline lancé: Instance ParamIQ SBS",
                    "payload": {"branch": "main"},
                    "created_at": now - timedelta(hours=2),
                },
            ]
        )
        print("[seed] activity_events insérés")
    else:
        print("[seed] activity_events déjà présents")

    print("[seed] terminé.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed MongoDB pour ParamIQ SBS")
    parser.add_argument("--reset", action="store_true", help="Supprime les données existantes avant seed")
    args = parser.parse_args()
    asyncio.run(seed_db(reset=args.reset))
