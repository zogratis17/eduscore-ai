"""Vocabulary quality analysis service."""
import re
from typing import Dict
from app.models.schemas import VocabularyAnalysis


class VocabularyService:
    """Service for vocabulary quality analysis."""
    
    @staticmethod
    def analyze(text: str) -> VocabularyAnalysis:
        """
        Analyze vocabulary quality.
        
        Args:
            text: Text to analyze
            
        Returns:
            VocabularyAnalysis: Analysis results
        """
        # Tokenize words
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        if not words:
            return VocabularyAnalysis(
                lexical_diversity=0.0,
                average_word_length=0.0,
                unique_words=0,
                total_words=0,
                score=0.0
            )
        
        # Calculate metrics
        total_words = len(words)
        unique_words = len(set(words))
        
        # Lexical diversity (Type-Token Ratio)
        lexical_diversity = unique_words / total_words
        
        # Average word length
        average_word_length = sum(len(word) for word in words) / total_words
        
        # Calculate score (0-100)
        # Good lexical diversity: 0.5-0.7 for academic writing
        # Good average word length: 4-6 characters
        
        # Lexical diversity score (normalize 0.5 as 100, linear)
        diversity_score = min(100, (lexical_diversity / 0.5) * 100)
        
        # Word length score (5 is optimal)
        length_diff = abs(average_word_length - 5)
        length_score = max(0, 100 - (length_diff * 15))
        
        # Combined score
        final_score = (diversity_score * 0.6) + (length_score * 0.4)
        
        return VocabularyAnalysis(
            lexical_diversity=round(lexical_diversity, 4),
            average_word_length=round(average_word_length, 2),
            unique_words=unique_words,
            total_words=total_words,
            score=round(final_score, 2)
        )


vocabulary_service = VocabularyService()
