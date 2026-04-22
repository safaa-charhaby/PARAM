import os
import pickle
import secrets
import tempfile
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
from bson import ObjectId
from fastapi import APIRouter, Body, File, HTTPException, UploadFile, Header, Depends
from .auth_keycloak import get_current_user
from fastapi.encoders import jsonable_encoder
from pymongo.errors import PyMongoError
from sentence_transformers import SentenceTransformer, util

from .database import (
    activity_events_collection,
    comparison_runs_collection,
    converter_runs_collection,
    generator_runs_collection,
    mapping_collection,
    pipeline_runs_collection,
    users_collection,
    validation_runs_collection,
)
from .models import AuthResponse, LoginRequest, MappingSchema, RegisterRequest, UpdateMappingSchema, UserPublic
from .xbrl_engine.xbrl_anomaly_explainer_v2 import analyze_xbrl_dataframe, load_xbrl_dataframe

router = APIRouter()

# --------- NLP ENGINE INITIALIZATION ---------
MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_INDEX_FILE = BASE_DIR / "ai_assistant" / "knowledge_base.pkl"
KB_DIR = BASE_DIR / "INPUT" / "data"
TOP_K = 3
SESSION_DURATION_HOURS = 12

print("Initialisation du modèle Sentence-BERT pour le Backend API...")
try:
    index_file = Path(os.getenv("PARAMIQ_KB_INDEX", str(DEFAULT_INDEX_FILE)))
    sbert_model = SentenceTransformer(MODEL_NAME)
    with open(index_file, "rb") as f:
        knowledge_base = pickle.load(f)
    print("Modèle et base de connaissances (RAG) chargés avec succès.")
except Exception as e:
    print(f"Attention: Impossible de charger le modèle IA ou le fichier index: {e}")
    sbert_model = None
    knowledge_base = None


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _normalize_email(email: str) -> str:
    return _safe_text(email).lower()



def _mongo_unavailable_detail() -> str:
    return "MongoDB indisponible. Vérifiez MONGO_DETAILS et que le serveur MongoDB est démarré."


def _raise_mongo_unavailable(_: Exception) -> None:
    raise HTTPException(status_code=503, detail=_mongo_unavailable_detail())


def _serialize_mongo_doc(document: Dict[str, Any] | None) -> Dict[str, Any] | None:
    if not document:
        return None
    serialized = dict(document)
    if serialized.get("_id") is not None:
        serialized["_id"] = str(serialized["_id"])
    if serialized.get("user_id") is not None:
        serialized["user_id"] = str(serialized["user_id"])
    return serialized


async def _push_activity(event_type: str, title: str, payload: Dict[str, Any] | None = None) -> None:
    try:
        await activity_events_collection.insert_one(
            {
                "event_type": event_type,
                "title": title,
                "payload": payload or {},
                "created_at": _utc_now(),
            }
        )
    except Exception:
        # Activity logging must not block business endpoints.
        return


def _safe_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _tokenize(text: str) -> set[str]:
    return {tok for tok in text.lower().replace("_", " ").split() if tok}


def _lexical_search(user_text: str, top_k: int = TOP_K) -> List[Dict[str, Any]]:
    if not knowledge_base or not knowledge_base.get("documents"):
        return []

    q_tokens = _tokenize(user_text)
    if not q_tokens:
        return []

    scored_docs = []
    for doc in knowledge_base["documents"]:
        text = _safe_text(doc.get("text", ""))
        d_tokens = _tokenize(text)
        if not d_tokens:
            continue
        overlap = len(q_tokens.intersection(d_tokens))
        score = overlap / max(1, len(q_tokens))
        if score > 0:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda item: item[0], reverse=True)
    return [{"score": score, "doc": doc} for score, doc in scored_docs[:top_k]]


def _semantic_search(user_text: str, top_k: int = TOP_K) -> List[Dict[str, Any]]:
    if not sbert_model or not knowledge_base:
        return []

    try:
        query_embedding = sbert_model.encode(user_text, convert_to_tensor=True)
        corpus_embeddings = knowledge_base["embeddings"]
        hits = util.semantic_search(query_embedding, corpus_embeddings, top_k=top_k)[0]
    except Exception:
        return []

    results = []
    for hit in hits:
        doc = knowledge_base["documents"][hit["corpus_id"]]
        results.append({"score": float(hit["score"]), "doc": doc})
    return results

def clean_rag_text(text):
    """Clean up raw RAG text for final display."""
    if not text: return ""
    # Remove technical prefixes that are no longer needed after smart_format
    text = text.replace("Label: ", "").replace("Description: ", "").replace("Definition: ", "").replace("Name: ", "")
    text = text.replace("Output: ", "").replace("Answer: ", "").replace("Meaning: ", "")
    # Remove separators
    text = text.replace(" | ", ". ").strip()
    if not text.endswith('.'): text += '.'
    return text


def _format_chat_response(user_text: str, lang: str, results: List[Dict[str, Any]]) -> str:
    if not results:
        return "Je n'ai pas trouvé d'information correspondante." if lang == 'fr' else "I couldn't find any relevant information."

    best_hit = results[0]
    doc = best_hit["doc"]
    score = best_hit["score"]
    display_text = _safe_text(doc.get('text', ''))
    clean_display = clean_rag_text(display_text.replace("Catégorie EBA:", ""))
    code_str = f" (Code: {doc['code']})" if doc.get('code') and doc['code'] != 'N/A' else ""
    source_str = doc.get('source', 'EBA Glossary')

    if lang == 'fr':
        if score < 0.20:
            response_text = f"Je pense avoir trouvé un concept proche : {clean_display}"
        else:
            response_text = f"Voici ce que j'ai trouvé dans les définitions EBA : {clean_display}"

        if any(w in user_text.lower() for w in ['erreur', 'error', 'null', 'fix', 'anomalie']):
            response_text += "\n\n💡 Pour corriger ce type d'anomalie, je vous conseille de vérifier la cohérence de `contextRef`, `unitRef` et `decimals` sur les faits numériques correspondants."
    else:
        if score < 0.20:
            response_text = f"I found a related concept that might help: {clean_display}"
        else:
            response_text = f"Here is what I found in the EBA definitions: {clean_display}"

        if any(w in user_text.lower() for w in ['error', 'null', 'fix', 'correction', 'anomaly']):
            response_text += "\n\n💡 Tip: To resolve this anomaly, you should verify the `contextRef`, `unitRef`, and `decimals` consistency on the corresponding numeric facts."

    return response_text


def _build_anomaly_issue(row: Dict[str, Any]) -> Dict[str, Any]:
    classification = _safe_text(row.get("anomaly_classification", "UNKNOWN"))
    severity = "CRITIQUE" if classification == "BUSINESS_VIOLATION" else "WARN"
    title = _safe_text(row.get("ai_title")) or "Anomalie détectée"
    detail = _safe_text(row.get("ai_fact_snapshot")) or "Données insuffisantes"

    return {
        "severity": severity,
        "title": title,
        "detail": detail,
        "classification": classification,
        "rule_code": _safe_text(row.get("ai_rule_code", "none")),
        "rule_label": _safe_text(row.get("ai_rule_label", "Aucune règle métier violée")),
        "ai_summary": _safe_text(row.get("ai_summary")),
        "ai_impact": _safe_text(row.get("ai_impact")),
        "ai_recommended_action": _safe_text(row.get("ai_recommended_action")),
        "ai_formula_expected": _safe_text(row.get("ai_formula_expected")),
        "ai_formula_detail": _safe_text(row.get("ai_formula_detail")),
        "ai_explanation": _safe_text(row.get("ai_explanation")),
    }


# --------- AUTHENTIFICATION (MONGODB) ---------

@router.get("/auth/me", response_description="Profil utilisateur courant")
async def auth_me(current_user: dict = Depends(get_current_user)):
    return current_user

# --------- ADMINISTRATION UTILISATEURS ---------

from pydantic import BaseModel
from typing import Optional

class AdminUserCreate(BaseModel):
    name: str
    email: str
    role: str
    password: str
    status: Optional[str] = "active"

class AdminUserUpdate(BaseModel):
    name: str
    email: str
    role: str
    status: str
    password: Optional[str] = None

@router.get("/admin/users", response_description="Lister tous les utilisateurs")
async def admin_get_users(current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
        
    try:
        users = await users_collection.find({}).to_list(1000)
        return [
            {
                "id": str(u["_id"]),
                "name": u.get("name", ""),
                "email": u.get("email", ""),
                "role": u.get("role", "analyst"),
                "status": "active" if u.get("is_active", True) else "inactive"
            }
            for u in users
        ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Impossible de lister les utilisateurs")


@router.post("/admin/users", response_description="Créer un utilisateur par un admin")
async def admin_create_user(payload: AdminUserCreate = Body(...), current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
        
    email = _normalize_email(payload.email)
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cet email")
        
    user_doc = {
        "name": _safe_text(payload.name),
        "email": email,
        "password_hash": "managed_by_keycloak",
        "role": payload.role if payload.role in ["admin", "analyst"] else "analyst",
        "is_active": payload.status == "active",
        "created_at": _utc_now(),
    }
    
    await users_collection.insert_one(user_doc)
    return {"message": "Utilisateur créé avec succès"}


@router.put("/admin/users/{user_id}", response_description="Modifier un utilisateur")
async def admin_update_user(user_id: str, payload: AdminUserUpdate = Body(...), current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
        
    update_fields = {
        "name": _safe_text(payload.name),
        "email": _normalize_email(payload.email),
        "role": payload.role if payload.role in ["admin", "analyst"] else "analyst",
        "is_active": payload.status == "active",
    }
    if payload.password and len(payload.password) >= 6:
        update_fields["password_hash"] = "managed_by_keycloak"
        
    res = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur mis à jour"}


@router.delete("/admin/users/{user_id}", response_description="Supprimer un utilisateur")
async def admin_delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
        
    if str(current_user["email"]) == user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
        
    res = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}


# --------- CRUD MAPPINGS ---------

@router.post("/mappings", response_description="Ajouter un nouveau mapping", response_model=MappingSchema)
async def create_mapping(mapping: MappingSchema = Body(...)):
    mapping_dict = jsonable_encoder(mapping)
    try:
        new_mapping = await mapping_collection.insert_one(mapping_dict)
        created_mapping = await mapping_collection.find_one({"_id": new_mapping.inserted_id})
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    return created_mapping

@router.get("/mappings", response_description="Lister tous les mappings", response_model=List[MappingSchema])
async def get_mappings():
    try:
        mappings = await mapping_collection.find().to_list(1000)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    return mappings

@router.put("/mappings/{id}", response_description="Mettre à jour le statut d'un mapping", response_model=MappingSchema)
async def update_mapping(id: str, mapping: UpdateMappingSchema = Body(...)):
    mapping_dict = {k: v for k, v in mapping.dict().items() if v is not None}
    try:
        mongo_id: Any = ObjectId(id) if ObjectId.is_valid(id) else id
    except Exception:
        mongo_id = id
    
    if len(mapping_dict) >= 1:
        try:
            update_result = await mapping_collection.update_one({"_id": mongo_id}, {"$set": mapping_dict})
        except PyMongoError as exc:
            _raise_mongo_unavailable(exc)

        if update_result.modified_count == 1:
            try:
                updated_mapping = await mapping_collection.find_one({"_id": mongo_id})
            except PyMongoError as exc:
                _raise_mongo_unavailable(exc)

            if updated_mapping is not None:
                return updated_mapping
                
    try:
        existing_mapping = await mapping_collection.find_one({"_id": mongo_id})
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    if existing_mapping is not None:
        return existing_mapping

    raise HTTPException(status_code=404, detail=f"Mapping {id} non trouvé")


# --------- DASHBOARD / ADMIN / PIPELINE / COMPARATEUR ---------

@router.get("/dashboard/summary", response_description="Résumé dashboard")
async def dashboard_summary():
    try:
        total_validations = await validation_runs_collection.count_documents({})
        avg_score_pipeline = [
            {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
        ]
        avg_score_result = await validation_runs_collection.aggregate(avg_score_pipeline).to_list(1)
        avg_score = round(float(avg_score_result[0]["avg_score"]), 2) if avg_score_result else 0.0

        error_stats_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "critique_total": {"$sum": "$critique_cnt"},
                    "warn_total": {"$sum": "$warn_cnt"},
                }
            }
        ]
        error_stats_result = await validation_runs_collection.aggregate(error_stats_pipeline).to_list(1)
        critique_total = int(error_stats_result[0]["critique_total"]) if error_stats_result else 0
        warn_total = int(error_stats_result[0]["warn_total"]) if error_stats_result else 0

        weekly_pipeline = [
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%G-W%V", "date": "$created_at"}},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": -1}},
            {"$limit": 6},
        ]
        weekly_data = await validation_runs_collection.aggregate(weekly_pipeline).to_list(6)
        weekly_data.reverse()

        recent_raw = await activity_events_collection.find().sort("created_at", -1).to_list(8)
        recent_activity = []
        for item in recent_raw:
            payload = item.get("payload", {})
            recent_activity.append(
                {
                    "_id": str(item.get("_id")),
                    "type": item.get("event_type", "info"),
                    "title": item.get("title", "Activité"),
                    "created_at": item.get("created_at"),
                    "payload": payload,
                }
            )

        return {
            "metrics": {
                "validated_files": total_validations,
                "compliance_rate": avg_score,
                "errors_total": critique_total + warn_total,
                "critique_total": critique_total,
            },
            "weekly_validations": [
                {
                    "label": row["_id"],
                    "count": int(row["count"]),
                }
                for row in weekly_data
            ],
            "recent_activity": recent_activity,
        }
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)


@router.get("/admin/users", response_description="Lister les utilisateurs")
async def admin_list_users():
    try:
        users = await users_collection.find().sort("created_at", -1).to_list(1000)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    response = []
    for user in users:
        response.append(
            {
                "id": str(user.get("_id")),
                "name": _safe_text(user.get("name")),
                "email": _safe_text(user.get("email")),
                "role": _safe_text(user.get("role", "analyst")),
                "status": "active" if user.get("is_active", True) else "inactive",
                "created_at": user.get("created_at"),
            }
        )
    return response


@router.post("/admin/users", response_description="Créer un utilisateur")
async def admin_create_user(payload: Dict[str, Any] = Body(...)):
    name = _safe_text(payload.get("name"))
    email = _normalize_email(_safe_text(payload.get("email")))
    role = _safe_text(payload.get("role", "analyst")).lower() or "analyst"
    status = _safe_text(payload.get("status", "active")).lower()
    password = _safe_text(payload.get("password", "ChangeMe123!"))

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Nom invalide")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Email invalide")
    if role not in {"admin", "analyst"}:
        raise HTTPException(status_code=400, detail="Rôle invalide")
    if status not in {"active", "inactive"}:
        raise HTTPException(status_code=400, detail="Statut invalide")

    try:
        existing = await users_collection.find_one({"email": email})
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    if existing:
        raise HTTPException(status_code=409, detail="Email déjà utilisé")

    user_doc = {
        "name": name,
        "email": email,
        "role": role,
        "is_active": status == "active",
        "password_hash": _hash_password(password),
        "created_at": _utc_now(),
    }

    try:
        insert_result = await users_collection.insert_one(user_doc)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    await _push_activity("admin_user_create", f"Nouvel utilisateur: {name}", {"email": email, "role": role})

    return {
        "id": str(insert_result.inserted_id),
        "name": name,
        "email": email,
        "role": role,
        "status": status,
    }


@router.put("/admin/users/{user_id}", response_description="Modifier un utilisateur")
async def admin_update_user(user_id: str, payload: Dict[str, Any] = Body(...)):
    updates: Dict[str, Any] = {}
    if "name" in payload:
        name = _safe_text(payload.get("name"))
        if len(name) < 2:
            raise HTTPException(status_code=400, detail="Nom invalide")
        updates["name"] = name

    if "email" in payload:
        email = _normalize_email(_safe_text(payload.get("email")))
        if "@" not in email:
            raise HTTPException(status_code=400, detail="Email invalide")
        updates["email"] = email

    if "role" in payload:
        role = _safe_text(payload.get("role")).lower()
        if role not in {"admin", "analyst"}:
            raise HTTPException(status_code=400, detail="Rôle invalide")
        updates["role"] = role

    if "status" in payload:
        status = _safe_text(payload.get("status")).lower()
        if status not in {"active", "inactive"}:
            raise HTTPException(status_code=400, detail="Statut invalide")
        updates["is_active"] = status == "active"

    if "password" in payload and _safe_text(payload.get("password")):
        updates["password_hash"] = _hash_password(_safe_text(payload.get("password")))

    if not updates:
        raise HTTPException(status_code=400, detail="Aucune mise à jour fournie")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide")

    try:
        result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    await _push_activity("admin_user_update", "Utilisateur modifié", {"user_id": user_id})
    return {"ok": True}


@router.delete("/admin/users/{user_id}", response_description="Supprimer un utilisateur")
async def admin_delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide")

    try:
        result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    await _push_activity("admin_user_delete", "Utilisateur supprimé", {"user_id": user_id})
    return {"ok": True}


@router.get("/pipeline/runs", response_description="Lister les exécutions pipeline")
async def list_pipeline_runs():
    try:
        runs = await pipeline_runs_collection.find().sort("created_at", -1).to_list(30)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    return [_serialize_mongo_doc(run) for run in runs]


@router.post("/pipeline/runs", response_description="Créer une nouvelle exécution pipeline")
async def create_pipeline_run(payload: Dict[str, Any] = Body(...)):
    task_name = _safe_text(payload.get("task_name")) or "Pipeline ParamIQ"
    branch = _safe_text(payload.get("branch")) or "main"

    run_doc = {
        "task_name": task_name,
        "branch": branch,
        "status": "success",
        "commit": secrets.token_hex(4),
        "created_at": _utc_now(),
        "completed_at": _utc_now(),
        "logs": [
            "Initialisation pipeline",
            "Vérification prérequis",
            "Traitement terminé avec succès",
        ],
    }

    try:
        result = await pipeline_runs_collection.insert_one(run_doc)
        run_doc["_id"] = result.inserted_id
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)

    await _push_activity("pipeline_run", f"Pipeline lancé: {task_name}", {"branch": branch})
    return _serialize_mongo_doc(run_doc)


@router.post("/compare/files", response_description="Comparer deux fichiers tabulaires")
async def compare_files(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    suffix_a = Path(file_a.filename or "a.csv").suffix or ".csv"
    suffix_b = Path(file_b.filename or "b.csv").suffix or ".csv"

    tmp_path_a: Path | None = None
    tmp_path_b: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix_a) as tmp_a:
            tmp_a.write(await file_a.read())
            tmp_path_a = Path(tmp_a.name)

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix_b) as tmp_b:
            tmp_b.write(await file_b.read())
            tmp_path_b = Path(tmp_b.name)

        df_a = load_xbrl_dataframe(tmp_path_a)
        df_b = load_xbrl_dataframe(tmp_path_b)

        concepts = sorted(set(df_a["concept"]).union(set(df_b["concept"])))
        rows = []
        same_count = 0
        changed_count = 0
        added_count = 0
        removed_count = 0

        for concept in concepts:
            val_a = df_a.loc[df_a["concept"] == concept, "value_num"]
            val_b = df_b.loc[df_b["concept"] == concept, "value_num"]

            value_a = float(val_a.iloc[0]) if len(val_a) > 0 and not np.isnan(val_a.iloc[0]) else None
            value_b = float(val_b.iloc[0]) if len(val_b) > 0 and not np.isnan(val_b.iloc[0]) else None

            if value_a is None and value_b is None:
                continue

            if value_a is None and value_b is not None:
                status = "added"
                added_count += 1
            elif value_a is not None and value_b is None:
                status = "removed"
                removed_count += 1
            elif abs(value_a - value_b) < 1e-9:
                status = "same"
                same_count += 1
            else:
                status = "changed"
                changed_count += 1

            delta = None
            delta_pct = None
            if value_a is not None and value_b is not None:
                delta = value_b - value_a
                if abs(value_a) > 1e-9:
                    delta_pct = (delta / value_a) * 100

            rows.append(
                {
                    "concept": concept,
                    "value_a": value_a,
                    "value_b": value_b,
                    "status": status,
                    "delta": delta,
                    "delta_pct": delta_pct,
                }
            )

        comparable_total = same_count + changed_count
        similarity = round((same_count / comparable_total) * 100, 2) if comparable_total > 0 else 0.0

        response_payload = {
            "file_a_name": file_a.filename,
            "file_b_name": file_b.filename,
            "summary": {
                "similarity": similarity,
                "added_count": added_count,
                "removed_count": removed_count,
                "changed_count": changed_count,
                "same_count": same_count,
                "total_rows": len(rows),
            },
            "rows": rows[:200],
        }

        try:
            await comparison_runs_collection.insert_one(
                {
                    **response_payload,
                    "created_at": _utc_now(),
                }
            )
            await _push_activity(
                "comparison",
                f"Comparaison: {file_a.filename} vs {file_b.filename}",
                response_payload["summary"],
            )
        except PyMongoError:
            pass

        return response_payload
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur de comparaison: {exc}") from exc
    finally:
        try:
            if tmp_path_a and tmp_path_a.exists():
                tmp_path_a.unlink()
            if tmp_path_b and tmp_path_b.exists():
                tmp_path_b.unlink()
        except Exception:
            pass


@router.get("/generator/forms", response_description="Lister les formulaires générés")
async def list_generated_forms():
    try:
        runs = await generator_runs_collection.find().sort("created_at", -1).to_list(30)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)
    return [_serialize_mongo_doc(run) for run in runs]


@router.post("/generator/forms/from-file", response_description="Générer un formulaire depuis un fichier taxonomie")
async def generate_form_from_file(file: UploadFile = File(...), max_fields: int = 120):
    if max_fields <= 0:
        raise HTTPException(status_code=400, detail="max_fields doit être positif")

    suffix = Path(file.filename or "taxonomy.csv").suffix or ".csv"
    tmp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = Path(tmp.name)

        df = load_xbrl_dataframe(tmp_path)
        if "concept" not in df.columns:
            raise HTTPException(status_code=400, detail="Fichier invalide: colonne concept introuvable")

        concept_series = df["concept"].dropna().astype(str)
        concepts = [c.strip() for c in concept_series.unique().tolist() if c.strip()]
        concepts = concepts[:max_fields]

        fields = []
        for concept in concepts:
            subset = df[df["concept"] == concept]
            numeric_ratio = 0.0
            if "value_num" in subset.columns and len(subset) > 0:
                numeric_ratio = float(subset["value_num"].notna().sum()) / float(len(subset))

            data_type = "number" if numeric_ratio >= 0.5 else "text"
            required = data_type == "number"

            fields.append(
                {
                    "name": concept,
                    "label": concept.split(":")[-1].replace("_", " "),
                    "datatype": data_type,
                    "required": required,
                    "placeholder": "0.00" if data_type == "number" else "Saisir une valeur",
                }
            )

        response_payload = {
            "form_name": f"Formulaire_{Path(file.filename or 'taxonomy').stem}",
            "source_file": file.filename,
            "fields_total": len(fields),
            "fields": fields,
        }

        try:
            await generator_runs_collection.insert_one({**response_payload, "created_at": _utc_now()})
            await _push_activity(
                "generator",
                f"Formulaire généré depuis {file.filename}",
                {"fields_total": len(fields)},
            )
        except PyMongoError:
            pass

        return response_payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {exc}") from exc
    finally:
        try:
            if tmp_path and tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass


@router.get("/converter/runs", response_description="Lister les conversions")
async def list_converter_runs():
    try:
        runs = await converter_runs_collection.find().sort("created_at", -1).to_list(30)
    except PyMongoError as exc:
        _raise_mongo_unavailable(exc)
    return [_serialize_mongo_doc(run) for run in runs]


@router.post("/converter/espf-to-csv", response_description="Convertir un fichier vers XBRL-CSV")
async def convert_espf_to_csv(file: UploadFile = File(...), preview_limit: int = 100):
    if preview_limit <= 0:
        raise HTTPException(status_code=400, detail="preview_limit doit être positif")

    suffix = Path(file.filename or "input.csv").suffix or ".csv"
    tmp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = Path(tmp.name)

        df = load_xbrl_dataframe(tmp_path)

        output_df = df.copy()
        for col in ["concept", "value_raw", "value_num", "context_ref", "unit_ref", "decimals"]:
            if col not in output_df.columns:
                output_df[col] = None

        output_df = output_df[["concept", "value_raw", "value_num", "context_ref", "unit_ref", "decimals"]]
        csv_content = output_df.to_csv(index=False)

        preview_rows = output_df.head(preview_limit).replace({np.nan: None}).to_dict(orient="records")
        response_payload = {
            "source_file": file.filename,
            "rows_total": int(len(output_df)),
            "columns": output_df.columns.tolist(),
            "preview_rows": preview_rows,
            "csv_content": csv_content,
        }

        try:
            await converter_runs_collection.insert_one(
                {
                    "source_file": file.filename,
                    "rows_total": int(len(output_df)),
                    "columns": output_df.columns.tolist(),
                    "created_at": _utc_now(),
                }
            )
            await _push_activity(
                "converter",
                f"Conversion CSV: {file.filename}",
                {"rows_total": int(len(output_df))},
            )
        except PyMongoError:
            pass

        return response_payload
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur de conversion: {exc}") from exc
    finally:
        try:
            if tmp_path and tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass

# --------- ASSISTANT IA CHAT ---------

from .agentic_rag import execute_agentic_workflow_stream
from fastapi.responses import StreamingResponse

@router.post("/chat", response_description="Envoyer un message à l'assistant AI en streaming")
async def chat_with_assistant(question: dict = Body(...)):
    user_text = _safe_text(question.get("text", ""))
    lang = _safe_text(question.get("lang", "fr")).lower() or "fr"
    context = _safe_text(question.get("context", ""))

    if not user_text:
        raise HTTPException(status_code=400, detail="Le message est vide")

    def rag_search_tool(query, top_k=2):
        if not knowledge_base:
            return []
        res = _semantic_search(query, top_k)
        if not res:
            res = _lexical_search(query, top_k)
        return res

    def db_stats_tool():
        return {"validated_files_count": "Available in the dashboard"}

    final_query = f"{user_text}\nContext: {context}" if context else user_text
    
    # Générateur asynchrone pour la FastAPI StreamingResponse
    async def chat_stream_generator():
        try:
            generator = execute_agentic_workflow_stream(
                user_text=final_query,
                lang=lang,
                semantic_search_fn=rag_search_tool,
                get_stats_fn=db_stats_tool
            )
            async for chunk in generator:
                yield chunk
        except Exception as e:
            print(f"Agentic Stream Error: {e}")
            results = rag_search_tool(user_text, TOP_K)
            fallback_text = _format_chat_response(user_text, lang, results)
            yield fallback_text

    return StreamingResponse(chat_stream_generator(), media_type="text/plain")


@router.post("/xbrl/analyze", response_description="Analyser un fichier XBRL et détecter les anomalies")
async def analyze_xbrl(file: UploadFile = File(...), contamination: float = 0.08):
    if contamination <= 0 or contamination >= 0.5:
        raise HTTPException(status_code=400, detail="contamination doit être entre 0 et 0.5")

    suffix = Path(file.filename or "input.csv").suffix or ".csv"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = Path(tmp.name)

        df = load_xbrl_dataframe(tmp_path)
        analysis = analyze_xbrl_dataframe(df, kb_dir=KB_DIR, contamination=contamination)

        summary = analysis["summary"]
        anomalies_df = analysis["anomalies"]
        issues = []
        for _, row in anomalies_df.head(200).iterrows():
            issues.append(_build_anomaly_issue(row.to_dict()))

        response_payload = {
            "score": max(0, 100 - int(summary.get("business_violations_count", 0) * 3 + summary.get("valid_rare_count", 0))),
            "total_lines": int(summary.get("rows_total", 0)),
            "critique_cnt": int(summary.get("business_violations_count", 0)),
            "warn_cnt": int(summary.get("valid_rare_count", 0)),
            "issues_total": len(issues),
            "issues": issues,
            "analysis_summary": summary,
        }

        try:
            await validation_runs_collection.insert_one(
                {
                    "file_name": file.filename,
                    **response_payload,
                    "created_at": _utc_now(),
                }
            )
            await _push_activity(
                "validation",
                f"Validation: {file.filename}",
                {
                    "score": response_payload["score"],
                    "critique_cnt": response_payload["critique_cnt"],
                    "warn_cnt": response_payload["warn_cnt"],
                },
            )
        except PyMongoError:
            pass

        return response_payload
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse XBRL: {exc}") from exc
    finally:
        try:
            if 'tmp_path' in locals() and tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass
