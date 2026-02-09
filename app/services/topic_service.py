"""Topic relevance analysis using sentence transformers."""
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.models.schemas import TopicRelevanceAnalysis


class TopicRelevanceService:
    """Service for topic relevance analysis."""
    
    def __init__(self):
        # Use a lightweight model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def analyze(self, submission_text: str, prompt_text: str = None) -> TopicRelevanceAnalysis:
        """
        Analyze topic relevance between submission and prompt.
        
        Args:
            submission_text: Student submission text
            prompt_text: Assignment prompt text (optional)
            
        Returns:
            TopicRelevanceAnalysis: Analysis results
        """
        if not prompt_text:
            # If no prompt provided, return default score
            return TopicRelevanceAnalysis(
                similarity_score=0.75,
                score=75.0,
                notes="No prompt provided for comparison"
            )
        
        # Generate embeddings
        embeddings = self.model.encode([submission_text, prompt_text])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(
            embeddings[0].reshape(1, -1),
            embeddings[1].reshape(1, -1)
        )[0][0]
        
        # Ensure similarity is between 0 and 1
        similarity = float(max(0, min(1, similarity)))
        
        # Convert to score (0-100)
        score = similarity * 100
        
        # Generate notes based on similarity
        if similarity >= 0.8:
            notes = "Excellent topic alignment"
        elif similarity >= 0.6:
            notes = "Good topic relevance"
        elif similarity >= 0.4:
            notes = "Moderate topic relevance"
        else:
            notes = "Low topic relevance - may be off-topic"
        
        return TopicRelevanceAnalysis(
            similarity_score=round(similarity, 4),
            score=round(score, 2),
            notes=notes
        )


topic_relevance_service = TopicRelevanceService()
