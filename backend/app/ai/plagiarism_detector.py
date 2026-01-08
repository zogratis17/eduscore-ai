import logging
import re
from typing import Dict, Any, List, Set
from datasketch import MinHash, MinHashLSH
from app.core.config import settings

logger = logging.getLogger(__name__)

class PlagiarismDetector:
    """
    Detects plagiarism using MinHash LSH (Locality Sensitive Hashing) to find
    similar documents in a local corpus.
    """
    
    def __init__(self, threshold: float = 0.7, num_perm: int = 128):
        self.threshold = threshold
        self.num_perm = num_perm
        self.lsh = MinHashLSH(threshold=threshold, num_perm=num_perm)
        self.corpus_signatures: Dict[str, MinHash] = {}
        self._is_initialized = False

    def _tokenize(self, text: str) -> Set[str]:
        """
        Converts text into a set of 3-grams (shingles) for MinHash.
        """
        if not text:
            return set()
            
        # Normalize: lowercase, remove special chars
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        words = text.split()
        
        # Create 3-grams
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

    def add_document(self, doc_id: str, text: str):
        """
        Adds a document to the LSH index.
        """
        if not text:
            return

        m = self._generate_minhash(text)
        
        # Store signature in memory (for exact Jaccard calc later)
        self.corpus_signatures[doc_id] = m
        
        # Insert into LSH index
        # remove first if exists to avoid duplicates
        if doc_id in self.lsh:
            self.lsh.remove(doc_id)
        self.lsh.insert(doc_id, m)
        logger.info(f"Added document {doc_id} to plagiarism corpus.")

    def check_plagiarism(self, text: str, exclude_doc_id: str = None) -> Dict[str, Any]:
        """
        Checks the text against the corpus.
        Returns percentage and list of similar documents.
        """
        if not text:
            return {"percentage": 0.0, "matches": []}

        query_minhash = self._generate_minhash(text)
        
        # Query LSH for candidates
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
                    # Heuristic: Take the max similarity as the "plagiarism percentage"
                    # or aggregate them. Usually, max similarity to a single source 
                    # is the strongest indicator.
                    total_similarity = max(total_similarity, similarity)

        return {
            "percentage": round(total_similarity * 100, 2),
            "matches": sorted(matches, key=lambda x: x['similarity'], reverse=True),
            "suspicion_level": self._get_suspicion_level(total_similarity * 100)
        }

    def _get_suspicion_level(self, percentage: float) -> str:
        if percentage > 70:
            return "high"
        elif percentage > 30:
            return "medium"
        else:
            return "low"

# Global instance
plagiarism_detector = PlagiarismDetector()
