from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from typing import Optional
import os
import json
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
firebase_app = None
try:
    # 1. Try to load from JSON file (Most Reliable)
    json_path = "/app/firebase-credentials.json"
    if os.path.exists(json_path):
        logger.info(f"Loading Firebase credentials from {json_path}")
        cred = credentials.Certificate(json_path)
        firebase_app = initialize_app(cred)
    else:
        # 2. Fallback to Environment Variables
        logger.info("Loading Firebase credentials from Environment Variables")
        # Handle Private Key Newlines
        private_key = os.getenv("FIREBASE_PRIVATE_KEY")
        if private_key:
            private_key = private_key.replace("\\n", "\n")
            
        cred = credentials.Certificate({
            "type": os.getenv("FIREBASE_TYPE"),
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": private_key,
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
            "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
            "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
        })
        firebase_app = initialize_app(cred)
        
    logger.info("Firebase Admin SDK initialized successfully.")
    
except Exception as e:
    logger.warning(f"Firebase Admin SDK could not be initialized: {e}")
    firebase_app = None

security = HTTPBearer()


class FirebaseAuth:
    """Firebase authentication handler"""
    
    @staticmethod
    async def verify_token(
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> dict:
        """
        Verify Firebase ID token and return decoded token
        """
        # --- MOCK AUTHENTICATION PATH ---
        if os.getenv("ENABLE_MOCK_AUTH") == "true":
            if credentials.credentials == "mock-token":
                return {
                    "uid": "mock-user-123",
                    "email": "student@eduscore.ai",
                    "email_verified": True,
                    "name": "Mock Student",
                    "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
        # --------------------------------
        
        if not firebase_app:
             raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is not configured."
            )

        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            token_str = credentials.credentials
            
            # Allow 30s clock skew tolerance (common with Docker containers)
            decoded_token = auth.verify_id_token(token_str, clock_skew_seconds=30)
            return decoded_token
            
        except auth.InvalidIdTokenError as e:
            logger.debug(f"InvalidIdTokenError: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except auth.ExpiredIdTokenError as e:
            logger.debug(f"ExpiredIdTokenError: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logger.debug(f"Token Verification Failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    async def get_current_user(token: dict) -> dict:
        """
        Extract user information from decoded token
        
        Args:
            token: Decoded Firebase token
            
        Returns:
            User information dictionary
        """
        return {
            "uid": token.get("uid"),
            "email": token.get("email"),
            "email_verified": token.get("email_verified", False),
            "name": token.get("name"),
            "picture": token.get("picture")
        }


# Dependency for protected routes
async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """FastAPI dependency for getting current authenticated user"""
    firebase_auth = FirebaseAuth()
    token = await firebase_auth.verify_token(credentials)
    return await firebase_auth.get_current_user(token)