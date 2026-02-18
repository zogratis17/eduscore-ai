import logging
from fastapi import APIRouter
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Cache Gemini status to avoid burning rate limit quota
_gemini_cache = {"status": None, "checked_at": 0}


@router.get("/status")
async def get_system_health():
    """
    Check health of all backend services.
    No auth required — this is a lightweight status check.
    """
    import time
    services = []

    # 1. MongoDB
    try:
        from app.db.mongodb import get_database
        db = await get_database()
        await db.command("ping")
        services.append({"name": "MongoDB", "status": "online"})
    except Exception as e:
        logger.warning(f"MongoDB health check failed: {e}")
        services.append({"name": "MongoDB", "status": "offline"})

    # 2. Redis
    try:
        import redis
        r = redis.from_url(settings.REDIS_URL, socket_timeout=2)
        r.ping()
        services.append({"name": "Redis", "status": "online"})
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")
        services.append({"name": "Redis", "status": "offline"})

    # 3. LanguageTool
    try:
        import httpx
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(f"{settings.LANGUAGETOOL_URL}/v2/languages")
            if resp.status_code == 200:
                services.append({"name": "LanguageTool", "status": "online"})
            else:
                services.append({"name": "LanguageTool", "status": "offline"})
    except Exception as e:
        logger.warning(f"LanguageTool health check failed: {e}")
        services.append({"name": "LanguageTool", "status": "offline"})

    # 4. Gemini AI — real ping, but cached for 5 minutes to avoid burning quota
    now = time.time()
    if _gemini_cache["status"] is not None and (now - _gemini_cache["checked_at"]) < 300:
        services.append({"name": "Gemini AI", "status": _gemini_cache["status"]})
    else:
        try:
            if not settings.GEMINI_API_KEY:
                raise ValueError("No API key configured")
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Use list_models instead of generate_content — doesn't count against quota
            models = list(genai.list_models())
            has_flash = any("gemini" in m.name.lower() for m in models)
            if has_flash:
                _gemini_cache["status"] = "online"
                _gemini_cache["checked_at"] = now
                services.append({"name": "Gemini AI", "status": "online"})
            else:
                _gemini_cache["status"] = "offline"
                _gemini_cache["checked_at"] = now
                services.append({"name": "Gemini AI", "status": "offline"})
        except Exception as e:
            logger.warning(f"Gemini health check failed: {e}")
            # Check if it's a rate limit error — API key is valid, just throttled
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower():
                _gemini_cache["status"] = "rate_limited"
                _gemini_cache["checked_at"] = now
                services.append({"name": "Gemini AI", "status": "rate_limited"})
            else:
                _gemini_cache["status"] = "offline"
                _gemini_cache["checked_at"] = now
                services.append({"name": "Gemini AI", "status": "offline"})

    # 5. MinIO
    try:
        from minio import Minio
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
        )
        client.bucket_exists(settings.MINIO_BUCKET)
        services.append({"name": "MinIO Storage", "status": "online"})
    except Exception as e:
        logger.warning(f"MinIO health check failed: {e}")
        services.append({"name": "MinIO Storage", "status": "offline"})

    online_count = sum(1 for s in services if s["status"] in ("online",))
    total = len(services)

    if online_count == total:
        overall = "healthy"
    elif online_count >= total - 1:
        overall = "degraded"
    else:
        overall = "unhealthy"

    return {"services": services, "overall": overall}
