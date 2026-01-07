import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status, Header

# Initialize Firebase Admin
# Expects FIREBASE_CREDENTIALS_PATH in .env or defaults to serviceAccountKey.json in the same directory
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

if not os.path.exists(cred_path):
    print(f"Warning: Firebase credentials not found at {cred_path}. Authentication will fail.")
    # We don't raise error here to allow server to start, but auth will fail.
    cred = None
else:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(authorization: str = Header(...)):
    """
    Verifies the Firebase ID token sent in the Authorization header.
    Format: Bearer <token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split("Bearer ")[1]
    
    try:
        # Verify the ID token while checking if the token is revoked by
        # check_revoked=True.
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
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
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
