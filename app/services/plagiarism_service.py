"""Plagiarism detection service using MinHash."""
from datasketch import MinHash, MinHashLSH
import re
from typing import List, Dict
from app.models.schemas import PlagiarismAnalysis, PlagiarismMatch
from app.database import get_database


class PlagiarismService:
    """Service for plagiarism detection."""
    
    def __init__(self):
        self.lsh = MinHashLSH(threshold=0.5, num_perm=128)
        self.document_hashes = {}
    
    async def analyze(
        self,
        text: str,
        document_id: str,
        check_against_corpus: bool = True
    ) -> PlagiarismAnalysis:
        """
        Analyze text for plagiarism.
        
        Args:
            text: Text to analyze
            document_id: Current document ID
            check_against_corpus: Whether to check against existing documents
            
        Returns:
            PlagiarismAnalysis: Analysis results
        """
        # Create MinHash for current document
        current_minhash = self._create_minhash(text)
        
        matched_segments = []
        max_similarity = 0.0
        
        if check_against_corpus:
            # Load existing documents from database
            db = get_database()
            cursor = db.documents.find(
                {"_id": {"$ne": document_id}, "status": "completed"},
                {"_id": 1, "extracted_text": 1, "filename": 1}
            ).limit(100)  # Limit for performance
            
            async for doc in cursor:
                if doc.get("extracted_text"):
                    # Create MinHash for comparison document
                    compare_minhash = self._create_minhash(doc["extracted_text"])
                    
                    # Calculate Jaccard similarity
                    similarity = current_minhash.jaccard(compare_minhash)
                    
                    if similarity > 0.3:  # Threshold for reporting
                        # Find matching segments
                        matches = self._find_matching_segments(
                            text,
                            doc["extracted_text"],
                            similarity
                        )
                        
                        matched_segments.extend(matches)
                        max_similarity = max(max_similarity, similarity)
        
        # Calculate similarity percentage
        similarity_percentage = max_similarity * 100
        
        # Score: Higher is better (100 = no plagiarism)
        score = max(0, 100 - similarity_percentage)
        
        return PlagiarismAnalysis(
            similarity_percentage=round(similarity_percentage, 2),
            matched_segments=matched_segments[:10],  # Limit to top 10 matches
            score=round(score, 2)
        )
    
    def _create_minhash(self, text: str) -> MinHash:
        """
        Create MinHash signature for text.
        
        Args:
            text: Text to hash
            
        Returns:
            MinHash: MinHash signature
        """
        minhash = MinHash(num_perm=128)
        
        # Create shingles (3-word sequences)
        words = re.findall(r'\b\w+\b', text.lower())
        
        for i in range(len(words) - 2):
            shingle = ' '.join(words[i:i+3])
            minhash.update(shingle.encode('utf-8'))
        
        return minhash
    
    def _find_matching_segments(
        self,
        text1: str,
        text2: str,
        similarity: float
    ) -> List[PlagiarismMatch]:
        """
        Find matching text segments between two documents.
        
        Args:
            text1: First text
            text2: Second text
            similarity: Overall similarity score
            
        Returns:
            List[PlagiarismMatch]: Matching segments
        """
        matches = []
        
        # Split into sentences
        sentences1 = re.split(r'[.!?]+', text1)
        sentences2 = re.split(r'[.!?]+', text2)
        
        # Compare sentences (simplified approach)
        for s1 in sentences1[:20]:  # Limit comparison
            s1 = s1.strip()
            if len(s1) < 20:  # Skip short sentences
                continue
                
            for s2 in sentences2[:20]:
                s2 = s2.strip()
                if len(s2) < 20:
                    continue
                
                # Simple word overlap check
                words1 = set(re.findall(r'\b\w+\b', s1.lower()))
                words2 = set(re.findall(r'\b\w+\b', s2.lower()))
                
                if len(words1) > 0:
                    overlap = len(words1 & words2) / len(words1)
                    
                    if overlap > 0.7:  # High overlap
                        matches.append(
                            PlagiarismMatch(
                                matched_text=s1[:200],  # Limit text length
                                source_document_id=None,
                                similarity=round(overlap, 2)
                            )
                        )
                        break
        
        return matches


plagiarism_service = PlagiarismService()
