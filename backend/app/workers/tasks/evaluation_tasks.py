from celery import shared_task
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from datetime import datetime
import logging
import asyncio

from app.core.config import settings
from app.services.evaluation_orchestrator import evaluation_orchestrator
from app.ai.plagiarism_detector import plagiarism_detector
from app.models.evaluation import Evaluation
from app.models.rubric import Rubric

logger = logging.getLogger(__name__)

async def run_async_evaluation(document_id: str, extracted_text: str, prompt: str = None, rubric_id: str = None):
    """
    Async function to run the evaluation and persistence logic.
    """
    # Async DB Client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DATABASE]
    
    try:
        # 1. Initialize Plagiarism Corpus (Load existing hashes)
        await plagiarism_detector.initialize(db)
        
        # 2. Fetch Rubric
        rubric_doc = None
        if rubric_id:
            try:
                rubric_doc = await db["rubrics"].find_one({"_id": ObjectId(rubric_id)})
            except Exception:
                logger.warning(f"Invalid rubric_id provided: {rubric_id}")
        
        # Fallback to default if no specific rubric found or provided
        if not rubric_doc:
             rubric_doc = await db["rubrics"].find_one({"is_default": True})

        rubric = None
        if rubric_doc:
            try:
                rubric = Rubric(**rubric_doc)
            except Exception as e:
                logger.error(f"Failed to parse rubric: {e}")
        
        # 3. Run Analysis
        results = await evaluation_orchestrator.evaluate_document(
            text=extracted_text, 
            document_id=document_id,
            prompt=prompt,
            rubric=rubric
        )
        
        # 4. Add to Plagiarism Corpus (Persist)
        # We add it AFTER evaluation so it doesn't plagiarize itself (though we have exclude_doc_id logic)
        await plagiarism_detector.add_document(db, document_id, extracted_text)
        
        return results
    finally:
        client.close()

@shared_task(name="evaluate_document_task")
def evaluate_document_task(document_id: str):
    """
    Background task to evaluate a document's text.
    """
    logger.info(f"Starting evaluation for document: {document_id}")
    
    # Synchronous MongoDB connection for fetching initial doc state
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DATABASE]
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

        rubric_id = doc.get("rubric_id")

        # 2. Run Evaluation (Async)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            results = loop.run_until_complete(
                run_async_evaluation(document_id, doc["extracted_text"], prompt=None, rubric_id=rubric_id)
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
            overall_feedback=results["overall_feedback"]
        )
        
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
                "final_score": results["final_score"],
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