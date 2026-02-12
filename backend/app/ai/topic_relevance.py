import re
import math
from collections import Counter
from typing import Dict, Any

class TopicRelevanceAnalyzer:
    """
    Analyzes topic relevance using pure-Python Cosine Similarity (TF logic).
    Compares the student's essay against a prompt/rubric.
    """
    
    def analyze(self, essay_text: str, prompt_text: str) -> Dict[str, Any]:
        """
        Calculates similarity between essay and prompt.
        """
        if not essay_text or not prompt_text:
            return {"score": 0, "similarity": 0}

        # Tokenize
        essay_vec = self._text_to_vector(essay_text)
        prompt_vec = self._text_to_vector(prompt_text)
        
        # Calculate Cosine Similarity
        similarity = self._get_cosine(essay_vec, prompt_vec)
        
        # Scoring Logic
        # If similarity > 0.3, it's usually relevant enough for a broad topic
        # Normalize: 0.0 -> 0, 0.5 -> 100 (optimistic scaling)
        score = min(similarity * 2.5, 1.0) * 100
        
        return {
            "score": round(score, 2),
            "similarity": round(similarity, 4),
            "is_relevant": score > 40
        }

    def _text_to_vector(self, text: str) -> Counter:
        words = re.findall(r'\w+', text.lower())
        return Counter(words)

    def _get_cosine(self, vec1: Counter, vec2: Counter) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])

        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)

        if not denominator:
            return 0.0
        else:
            return float(numerator) / denominator

topic_relevance_analyzer = TopicRelevanceAnalyzer()
