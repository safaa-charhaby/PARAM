import os
import httpx
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional

KEYCLOAK_URL = os.environ.get("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.environ.get("KEYCLOAK_REALM", "paramiq")
KEYCLOAK_CLIENT_ID = os.environ.get("KEYCLOAK_CLIENT_ID", "paramiq-frontend")

JWKS_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"

security = HTTPBearer()

# Cache for JWKS keys
_jwks_cache: Optional[Dict[str, Any]] = None

async def get_keycloak_public_keys():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(JWKS_URL)
                response.raise_for_status()
                _jwks_cache = response.json()
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Could not fetch Keycloak keys: {str(e)}"
                )
    return _jwks_cache

async def verify_token(token: str) -> Dict[str, Any]:
    try:
        # Get public keys from Keycloak
        jwks = await get_keycloak_public_keys()
        
        # Get unverified header to extract kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")
            
        # Find the RSA key corresponding to kid
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
                
        if not rsa_key:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to find appropriate key")
            
        # Verify and decode token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False} # Often needed for Keycloak tokens
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = await verify_token(token)
    
    # Extract user info
    email = payload.get("email")
    if not email:
        # Some Keycloak configs might use preferred_username instead of email
        email = payload.get("preferred_username")
        
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing email/username")
        
    name = payload.get("name", "")
    
    # Extract role from realm_access
    realm_access = payload.get("realm_access", {})
    roles = realm_access.get("roles", [])
    
    user_role = "user"
    if "admin" in roles:
        user_role = "admin"
    elif "analyst" in roles:
        user_role = "analyst"
        
    return {
        "email": email,
        "name": name,
        "role": user_role
    }
