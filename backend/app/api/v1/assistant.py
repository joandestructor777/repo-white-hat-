from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.assistant_schema import ChatMessageRequest, AssistantChatResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["Virtual Assistant Web"])

@router.post("/chat", response_model=AssistantChatResponse, summary="Interactuar con el asistente web (Protegido por Guardrail)")
def chat_with_assistant(
    payload: ChatMessageRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Simula el asistente virtual desplegado en la página web corporativa.
    Antes de procesar la respuesta, el mensaje es interceptado por el motor de ciberseguridad
    para detectar palabras clave sospechosas, extracción de datos confidenciales o jailbreaks.
    """
    client_ip = payload.client_ip or (request.client.host if request.client else "127.0.0.1")
    return AssistantService.process_chat(db=db, prompt=payload.message, client_ip=client_ip)
