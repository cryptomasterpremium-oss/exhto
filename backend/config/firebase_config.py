from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import Client


def _initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    service_account_path = Path(__file__).resolve().parent / "serviceAccountKey.json"

    if not service_account_path.exists():
        raise RuntimeError(
            f"Firebase service account file not found at: {service_account_path}"
        )

    cred = credentials.Certificate(str(service_account_path))
    firebase_admin.initialize_app(cred)


def get_db() -> Client:
    _initialize_firebase()
    return firestore.client()
