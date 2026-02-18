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


def _update_status(doc_collection, document_id: str, status: str):
    """Helper to update document processing status in MongoDB."""
    doc_collection.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
    )


async def run_async_evaluation(
    document_id: str,
    extracted_text: str,
    prompt: str = None,
    rubric_id: str = None,
    status_callback=None,
):
    """
    Async function to run the evaluation and persistence logic.
    status_callback is called with each stage name for progress tracking.
    """
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DATABASE]

    try:
        # Initialize Plagiarism Corpus
        await plagiarism_detector.initialize(db)

        # Fetch Rubric
        rubric_doc = None
        if rubric_id:
            try:
                rubric_doc = await db["rubrics"].find_one(
                    {"_id": ObjectId(rubric_id)}
                )
            except Exception:
                logger.warning(f"Invalid rubric_id provided: {rubric_id}")

        if not rubric_doc:
            rubric_doc = await db["rubrics"].find_one({"is_default": True})

        rubric = None
        if rubric_doc:
            try:
                rubric = Rubric(**rubric_doc)
            except Exception as e:
                logger.error(f"Failed to parse rubric: {e}")

        # Run Analysis with progress callback
        results = await evaluation_orchestrator.evaluate_document(
            text=extracted_text,
            document_id=document_id,
            prompt=prompt,
            rubric=rubric,
            status_callback=status_callback,
        )

        # Add to Plagiarism Corpus
        await plagiarism_detector.add_document(db, document_id, extracted_text)

        return results
    finally:
        client.close()


@shared_task(name="evaluate_document_task", bind=True)
def evaluate_document_task(self, document_id: str):
    """
    Background task to evaluate a document's text.
    Retries automatically if Gemini is rate-limited.
    """
    logger.info(f"Starting evaluation for document: {document_id}")

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
                {"$set": {"status": "failed", "error_message": "No text extracted"}},
            )
            return

        rubric_id = doc.get("rubric_id")
        prompt = doc.get("prompt")  # Pass the actual prompt instead of None

        # Create a status callback that writes to MongoDB
        def status_callback(stage: str):
            _update_status(doc_collection, document_id, stage)

        # 2. Run Evaluation (Async)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            results = loop.run_until_complete(
                run_async_evaluation(
                    document_id,
                    doc["extracted_text"],
                    prompt=prompt,
                    rubric_id=rubric_id,
                    status_callback=status_callback,
                )
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
            overall_feedback=results["overall_feedback"],
            score_breakdown=results.get("score_breakdown"),
            scoring_engine=results.get("scoring_engine", "unknown"),
            rubric_used=results.get("rubric_used", "Default"),
        )

        eval_collection.replace_one(
            {"document_id": document_id},
            eval_in.model_dump(by_alias=True, exclude={"id"}),
            upsert=True,
        )

        # 4. Update Document Status
        doc_collection.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "status": "evaluated",
                    "final_score": results["final_score"],
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        logger.info(f"Evaluation completed for document {document_id}")

    except Exception as e:
        error_msg = str(e)
        # Check if it's a Gemini availability/rate-limit error
        if "Gemini" in error_msg or "429" in error_msg or "quota" in error_msg.lower():
            logger.warning(f"Gemini rate limited/unavailable for doc {document_id}. Retrying in 30s. Error: {error_msg}")
            # Ensure status remains 'processing' so user knows it's active
            doc_collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {"status": "processing", "updated_at": datetime.utcnow()}}
            )
            # Retry the task
            raise self.retry(exc=e, countdown=30, max_retries=10)
        
        # Genuine failure
        logger.error(f"Error evaluating document {document_id}: {error_msg}")
        doc_collection.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "status": "failed_evaluation",
                    "error_message": error_msg,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
    finally:
        client.close()