from celery import shared_task
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import logging
import os

from app.core.config import settings
from app.services.document_parser import document_parser
from app.ai.plagiarism_detector import plagiarism_detector

logger = logging.getLogger(__name__)

@shared_task(name="process_uploaded_document")
def process_uploaded_document(document_id: str):
    """
    Background task to parse the uploaded document and extract text/metadata.
    """
    logger.info(f"Starting processing for document: {document_id}")
    
    # Connect to MongoDB (Synchronous)
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    collection = db["documents"]
    
    try:
        # 1. Fetch document
        doc = collection.find_one({"_id": ObjectId(document_id)})
        if not doc:
            logger.error(f"Document {document_id} not found.")
            return

        # 2. Update status to processing
        collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "processing", "updated_at": datetime.utcnow()}}
        )
        
        # 3. Parse Document
        file_path = doc.get("storage_path")
        if not file_path or not os.path.exists(file_path):
             raise ValueError(f"File not found at path: {file_path}")
             
        # Actual parsing logic
        parsed_data = document_parser.parse_file(file_path)
        
        # 4. Add to Plagiarism Corpus
        if parsed_data.get("extracted_text"):
            plagiarism_detector.add_document(document_id, parsed_data["extracted_text"])
        
        # 5. Update document with results
        update_data = {
            "extracted_text": parsed_data["extracted_text"],
            "word_count": parsed_data["word_count"],
            "page_count": parsed_data["page_count"],
            "status": "completed",
            "updated_at": datetime.utcnow()
        }
        
        collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": update_data}
        )
        logger.info(f"Document {document_id} processed successfully.")

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}")
        collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "status": "failed",
                "error_message": str(e),
                "updated_at": datetime.utcnow()
            }}
        )
    finally:
        client.close()
