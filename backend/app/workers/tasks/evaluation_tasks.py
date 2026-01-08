from celery import shared_task
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import logging
import asyncio

from app.core.config import settings
from app.services.evaluation_orchestrator import evaluation_orchestrator
from app.models.evaluation import Evaluation

logger = logging.getLogger(__name__)

# Helper to run async code in sync Celery task
def run_async(coro):
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # Ideally we shouldn't be here in a worker, but just in case
        return asyncio.ensure_future(coro)
    else:
        return loop.run_until_complete(coro)

@shared_task(name="evaluate_document_task")
def evaluate_document_task(document_id: str):
    """
    Background task to evaluate a document's text.
    """
    logger.info(f"Starting evaluation for document: {document_id}")
    
    # Synchronous MongoDB connection for Celery
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    doc_collection = db["documents"]
    eval_collection = db["evaluations"]
    
    try:
        # 1. Fetch Document
        doc = doc_collection.find_one({"_id": ObjectId(document_id)})
        if not doc:
            logger.error(f"Document {document_id} not found.")
            return
            
        if not doc.get("extracted_text"):
            logger.error(f"Document {document_id} has no extracted text.")
            doc_collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {"status": "failed", "error_message": "No text extracted"}}
            )
            return

        # 2. Run Evaluation (Async call wrapped in sync)
        # We need a fresh event loop for the async orchestrator
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            results = loop.run_until_complete(
                evaluation_orchestrator.evaluate_document(doc["extracted_text"])
            )
        finally:
            loop.close()
            
        # 3. Save Evaluation
        eval_in = Evaluation(
            document_id=document_id,
            user_id=doc.get("uploaded_by"),
            final_score=results["final_score"],
            grade=results["grade"],
            components=results["components"],
            feedback=results["feedback"]
        )
        
        # Upsert evaluation (replace if exists)
        eval_collection.replace_one(
            {"document_id": document_id},
            eval_in.model_dump(by_alias=True, exclude={"id"}),
            upsert=True
        )
        
        # 4. Update Document Status
        doc_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "status": "evaluated", 
                "final_score": results["final_score"], # Store simple score on doc for easy listing
                "updated_at": datetime.utcnow()
            }}
        )
        
        logger.info(f"Evaluation completed for document {document_id}")

    except Exception as e:
        logger.error(f"Error evaluating document {document_id}: {str(e)}")
        doc_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "status": "failed_evaluation",
                "error_message": str(e),
                "updated_at": datetime.utcnow()
            }}
        )
    finally:
        client.close()
