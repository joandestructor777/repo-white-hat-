from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.assistant_schema import ChatMessageRequest, AssistantChatResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["Virtual Assistant Web"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_assistant(
    payload: ChatMessageRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = payload.client_ip or (request.client.host if request.client else "127.0.0.1")
    return AssistantService.process_chat(db=db, prompt=payload.message, client_ip=client_ip)
