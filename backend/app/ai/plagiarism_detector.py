import logging
import re
import pickle
from typing import Dict, Any, List, Set
from datasketch import MinHash, MinHashLSH
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

class PlagiarismDetector:
    """
    Detects plagiarism using MinHash LSH (Locality Sensitive Hashing).
    Persists signatures to MongoDB to maintain corpus across restarts.
    """
    
    def __init__(self, threshold: float = 0.5, num_perm: int = 128):
        self.threshold = threshold
        self.num_perm = num_perm
        self.lsh = MinHashLSH(threshold=threshold, num_perm=num_perm)
        self.corpus_signatures: Dict[str, MinHash] = {}
        self._is_initialized = False

    async def initialize(self, db: AsyncIOMotorDatabase):
        """
        Loads all existing hashes from MongoDB into memory.
        This should be called on app startup.
        """
        if self._is_initialized:
            return

        logger.info("Initializing Plagiarism Corpus from MongoDB...")
        count = 0
        cursor = db["plagiarism_hashes"].find({})
        async for doc in cursor:
            try:
                # Load MinHash from binary
                minhash = pickle.loads(doc["signature"])
                doc_id = doc["document_id"]
                
                self.corpus_signatures[doc_id] = minhash
                self.lsh.insert(doc_id, minhash)
                count += 1
            except Exception as e:
                logger.error(f"Failed to load hash for {doc.get('document_id')}: {e}")
        
        self._is_initialized = True
        logger.info(f"Loaded {count} documents into Plagiarism LSH index.")

    def _tokenize(self, text: str) -> Set[str]:
        if not text:
            return set()
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        words = text.split()
        shingles = set()
        for i in range(len(words) - 2):
            shingle = " ".join(words[i:i+3])
            shingles.add(shingle)
        return shingles

    def _generate_minhash(self, text: str) -> MinHash:
        shingles = self._tokenize(text)
        m = MinHash(num_perm=self.num_perm)
        for s in shingles:
            m.update(s.encode('utf8'))
        return m

    async def add_document(self, db: AsyncIOMotorDatabase, doc_id: str, text: str):
        """
        Adds a document to the LSH index and persists to MongoDB.
        """
        if not text:
            return

        m = self._generate_minhash(text)
        
        # 1. Update In-Memory
        if doc_id in self.lsh:
            self.lsh.remove(doc_id)
        self.lsh.insert(doc_id, m)
        self.corpus_signatures[doc_id] = m
        
        # 2. Persist to MongoDB
        signature_blob = pickle.dumps(m)
        await db["plagiarism_hashes"].update_one(
            {"document_id": doc_id},
            {"$set": {
                "document_id": doc_id, 
                "signature": signature_blob,
                "updated_at": settings.PROJECT_NAME # timestamp placeholder or util
            }},
            upsert=True
        )
        logger.info(f"Added document {doc_id} to plagiarism corpus (Persisted).")

    def check_plagiarism(self, text: str, exclude_doc_id: str = None) -> Dict[str, Any]:
        """
        Checks the text against the in-memory corpus.
        (Querying is fast enough in-memory, no need to query Mongo for search)
        """
        if not text:
            return {"percentage": 0.0, "matches": []}

        query_minhash = self._generate_minhash(text)
        
        candidates = self.lsh.query(query_minhash)
        matches = []
        total_similarity = 0.0
        
        for doc_id in candidates:
            if doc_id == exclude_doc_id:
                continue
                
            target_minhash = self.corpus_signatures.get(doc_id)
            if target_minhash:
                similarity = query_minhash.jaccard(target_minhash)
                
                if similarity >= self.threshold:
                    matches.append({
                        "doc_id": doc_id,
                        "similarity": round(similarity * 100, 2)
                    })
                    total_similarity = max(total_similarity, similarity)

        return {
            "percentage": round(total_similarity * 100, 2),
            "matches": sorted(matches, key=lambda x: x['similarity'], reverse=True),
            "suspicion_level": self._get_suspicion_level(total_similarity * 100)
        }

    def _get_suspicion_level(self, percentage: float) -> str:
        if percentage > 70: return "high"
        elif percentage > 30: return "medium"
        else: return "low"

plagiarism_detector = PlagiarismDetector()