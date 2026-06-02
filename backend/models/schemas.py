from datetime import datetime
from typing import Dict

from pydantic import BaseModel, ConfigDict, Field


class CrisisRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    business_category: str = Field(..., min_length=2, max_length=120)
    crisis_description: str = Field(..., min_length=20, max_length=8000)


class CrisisSessionResponse(BaseModel):
    session_id: str
    business_category: str
    crisis_description: str
    bot_consultations: Dict[str, str]
    final_recovery_plan: str
    created_at: datetime
