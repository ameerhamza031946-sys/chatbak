import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from app.schemas.chat import (
    ConversationResponse, 
    ConversationDetailResponse, 
    MessageSend, 
    ConversationRename,
    MessageResponse
)
from app.services.db_service import db_service
from app.services.ai_service import ai_service
from app.middleware.auth import get_current_user
from app.models.domain import User

logger = logging.getLogger("app.routes.chat")
router = APIRouter(prefix="/chat", tags=["Chat & Conversations"])

@router.get("/history", response_model=List[ConversationResponse])
async def get_chat_history(current_user: User = Depends(get_current_user)):
    """Fetch all conversations for the authenticated user."""
    convos = await db_service.get_conversations(current_user.id)
    return convos

@router.get("/{id}", response_model=ConversationDetailResponse)
async def get_chat_detail(id: str, current_user: User = Depends(get_current_user)):
    """Fetch details of a specific conversation, including all its messages."""
    convo = await db_service.get_conversation(id, current_user.id)
    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )
    
    messages = await db_service.get_messages(id)
    return ConversationDetailResponse(
        id=convo.id,
        title=convo.title,
        pinned=convo.pinned,
        created_at=convo.created_at,
        updated_at=convo.updated_at,
        model=convo.model,
        temperature=convo.temperature,
        messages=messages
    )

@router.put("/{id}/rename", response_model=ConversationResponse)
async def rename_chat(
    id: str, 
    payload: ConversationRename, 
    current_user: User = Depends(get_current_user)
):
    """Rename a conversation's title."""
    convo = await db_service.rename_conversation(id, current_user.id, payload.title)
    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or unauthorized."
        )
    return convo

@router.put("/{id}/pin", response_model=ConversationResponse)
async def pin_chat(
    id: str, 
    pinned: bool = Query(..., description="Set true to pin, false to unpin"), 
    current_user: User = Depends(get_current_user)
):
    """Pin or unpin a conversation."""
    convo = await db_service.pin_conversation(id, current_user.id, pinned)
    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or unauthorized."
        )
    return convo

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_chat(id: str, current_user: User = Depends(get_current_user)):
    """Delete a conversation and all its messages."""
    success = await db_service.delete_conversation(id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or unauthorized."
        )
    return {"success": True, "message": "Conversation deleted successfully."}

@router.get("/{id}/export")
async def export_chat(id: str, current_user: User = Depends(get_current_user)):
    """Export the conversation as a readable text format."""
    convo = await db_service.get_conversation(id, current_user.id)
    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )
    
    messages = await db_service.get_messages(id)
    export_data = {
        "title": convo.title,
        "model": convo.model,
        "exported_at": convo.updated_at.isoformat(),
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
                "model": m.model
            } for m in messages
        ]
    }
    return export_data

@router.post("/send")
async def send_message(
    payload: MessageSend, 
    current_user: User = Depends(get_current_user)
):
    """
    Send a prompt to the AI.
    Streams back a SSE event stream with the conversation ID, new message details, and text content.
    """
    conversation_id = payload.conversation_id
    model = payload.model or "gpt-4o-mini"
    temperature = payload.temperature if payload.temperature is not None else 0.7

    # If conversation_id is not provided, create a new conversation session
    is_new_convo = False
    if not conversation_id:
        is_new_convo = True
        # Generate initial title from prompt
        title = payload.content[:35] + "..." if len(payload.content) > 35 else payload.content
        convo = await db_service.create_conversation(
            user_id=current_user.id, 
            title=title, 
            model=model,
            temperature=temperature
        )
        conversation_id = convo.id
    else:
        # Check if conversation exists and belongs to user
        convo = await db_service.get_conversation(conversation_id, current_user.id)
        if not convo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found."
            )
            
    # Save the user's message
    user_message = await db_service.create_message(
        conversation_id=conversation_id,
        role="user",
        content=payload.content
    )

    # Fetch conversation messages to provide context
    all_messages = await db_service.get_messages(conversation_id)
    
    # Format messages context for the model
    context = [{"role": m.role, "content": m.content} for m in all_messages]

    async def event_generator():
        accumulated_response = []
        try:
            # 1. Send conversation metadata event if it's new
            if is_new_convo:
                yield f"data: {json.dumps({'type': 'metadata', 'conversation_id': conversation_id, 'title': convo.title})}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'metadata', 'conversation_id': conversation_id})}\n\n"
                
            # 2. Get and stream response chunks from AI
            async for chunk in ai_service.stream_chat(
                messages=context,
                model_name=model,
                temperature=temperature
            ):
                accumulated_response.append(chunk)
                yield f"data: {json.dumps({'type': 'content', 'delta': chunk})}\n\n"
                
            # 3. Save assistant message and send done event
            assistant_content = "".join(accumulated_response)
            assistant_msg = await db_service.create_message(
                conversation_id=conversation_id,
                role="assistant",
                content=assistant_content,
                model=model
            )
            
            # Update last activity timestamp on conversation
            await db_service.update_conversation_time(conversation_id, current_user.id)
            
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming event generator: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            
            # Save whatever we have so far
            if accumulated_response:
                assistant_content = "".join(accumulated_response)
                await db_service.create_message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=assistant_content,
                    model=model
                )
                await db_service.update_conversation_time(conversation_id, current_user.id)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
