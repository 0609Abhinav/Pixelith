"""
MongoDB Atlas connection and collection helpers.
Falls back gracefully to None so the app still boots
if the connection string is missing or the host is unreachable.
"""
from __future__ import annotations

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── connection string (set via env var or hardcoded fallback) ──────────────
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://abhinavtripathi6sep_db_user:YJO3KhSNMzi5tSzv@cluster0.ycult9j.mongodb.net/?appName=Cluster0",
)
DB_NAME = os.environ.get("MONGO_DB", "darkvampire")

_client = None
_db = None


def get_db():
    """Return the Motor AsyncIOMotorDatabase, initialising on first call."""
    global _client, _db
    if _db is not None:
        return _db
    try:
        import motor.motor_asyncio as motor  # type: ignore

        _client = motor.AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        _db = _client[DB_NAME]
        logger.info("MongoDB Atlas connected → database: %s", DB_NAME)
    except Exception as exc:  # pragma: no cover
        logger.error("MongoDB connection failed: %s — using in-memory fallback", exc)
        _db = None
    return _db


def bookings_col():
    db = get_db()
    return db["bookings"] if db is not None else None


def contacts_col():
    db = get_db()
    return db["contacts"] if db is not None else None
