from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from typing import Optional
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate({
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
})

firebase_app = initialize_app(cred)
security = HTTPBearer()


class FirebaseAuth:
    """Firebase authentication handler"""
    
    @staticmethod
    async def verify_token(
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> dict:
        """
        Verify Firebase ID token and return decoded token
        
        Args:
            credentials: HTTP Authorization header with Bearer token
            
        Returns:
            Decoded token containing user info
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(credentials.credentials)
            return decoded_token
            
        except auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
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
