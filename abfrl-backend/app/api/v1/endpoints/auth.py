"""
Authentication endpoints - Firebase only (no MongoDB user storage).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
import firebase_admin
from firebase_admin import auth as firebase_auth

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Verify Firebase token and return user info.
    No MongoDB - Firebase is the single source of truth.
    """
    try:
        # Verify the Firebase ID token
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', email.split('@')[0])
        
        # Return Firebase user info directly (no MongoDB)
        return {
            "uid": uid,
            "email": email,
            "name": name,
            "role": "user"  # Default role for customers
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin_user(
    current_user = Depends(get_current_user)
):
    """
    Verify that current user is an admin.
    Note: With Firebase-only auth, role checking requires custom claims.
    """
    if current_user.get("role") != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/me")
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """
    Get current user information from Firebase token.
    """
    return current_user


@router.patch("/me")
async def update_current_user(
    user_update: dict,
    current_user = Depends(get_current_user)
):
    """
    Update current user information.
    Note: With Firebase-only auth, profile updates require Firebase Admin SDK.
    """
    return {
        "message": "Profile update not implemented - Firebase handles user data",
        "note": "Use Firebase Admin SDK to update user profiles"
    }
