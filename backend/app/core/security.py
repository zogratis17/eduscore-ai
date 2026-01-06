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


# ============================================================================
# BACKEND: Auth Endpoints
# File: backend/app/api/v1/endpoints/auth.py
# ============================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from app.db.mongodb import get_database
from app.models.user import User
from app.schemas.auth import UserResponse, UserUpdate
from app.core.security import get_current_user_dependency
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(
    current_user: dict = Depends(get_current_user_dependency),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Register a new user after Firebase authentication
    This is called once after first Firebase login
    """
    # Check if user already exists
    existing_user = await db.users.find_one({"firebase_uid": current_user["uid"]})
    
    if existing_user:
        return UserResponse(**existing_user)
    
    # Create new user document
    new_user = User(
        firebase_uid=current_user["uid"],
        email=current_user["email"],
        name=current_user.get("name", current_user["email"]),
        profile_picture=current_user.get("picture"),
        last_login=datetime.utcnow()
    )
    
    result = await db.users.insert_one(new_user.dict(by_alias=True))
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return UserResponse(**created_user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user_dependency),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Get current user's profile"""
    user = await db.users.find_one({"firebase_uid": current_user["uid"]})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update last login
    await db.users.update_one(
        {"firebase_uid": current_user["uid"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return UserResponse(**user)


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user_dependency),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Update current user's profile"""
    update_data = user_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.find_one_and_update(
        {"firebase_uid": current_user["uid"]},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**result)


# ============================================================================
# FRONTEND: Firebase Configuration
# File: frontend/src/services/firebase.js
# ============================================================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };


// ============================================================================
// FRONTEND: Auth Service
// File: frontend/src/services/authService.js
// ============================================================================

import { auth, signInWithEmailAndPassword, signOut } from './firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

class AuthService {
  async login(email, password) {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Register/sync user with backend
      const response = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );
      
      return {
        user: response.data,
        token: idToken
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;
    
    const idToken = await user.getIdToken();
    const response = await axios.get(
      `${API_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );
    
    return response.data;
  }
  
  async refreshToken() {
    const user = auth.currentUser;
    if (!user) return null;
    
    return await user.getIdToken(true); // Force refresh
  }
}

export default new AuthService();


// ============================================================================
// FRONTEND: Axios Interceptor
// File: frontend/src/services/api.js
// ============================================================================

import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true); // Force refresh
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;