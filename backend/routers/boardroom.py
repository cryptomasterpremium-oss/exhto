from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from google.cloud.firestore_v1 import Client

from config.firebase_config import get_db
from models.schemas import CrisisRequest, CrisisSessionResponse
from services.agent_service import AIBoardroomManager


router = APIRouter(prefix="/api/boardroom", tags=["AI Boardroom"])


@router.post(
    "/analyze",
    response_model=CrisisSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def analyze_business_crisis(
    request: CrisisRequest,
    db: Client = Depends(get_db),
) -> CrisisSessionResponse:
    manager = AIBoardroomManager()
    response = await manager.process_crisis_boardroom(request)
    payload = response.model_dump(mode="python")

    try:
        await run_in_threadpool(
            db.collection("crisis_sessions")
            .document(response.session_id)
            .set,
            payload,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI analysis completed, but saving the crisis session to Firestore failed.",
        ) from exc

    return response
