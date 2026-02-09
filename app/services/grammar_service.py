"""Grammar and language analysis service."""
import textstat
import re
from typing import List, Dict, Set
from app.models.schemas import GrammarAnalysis, GrammarError
from app.config import settings

try:
    from textblob import TextBlob
    import spacy
    GRAMMAR_AVAILABLE = True
except ImportError:
    GRAMMAR_AVAILABLE = False
    print("Warning: TextBlob or spaCy not installed. Grammar checking will be limited.")

# Whitelist of technical and domain-specific terms that should not be flagged
WHITELIST_TERMS = {
    # Technical terms
    'iot', 'ai', 'ml', 'api', 'ui', 'ux', 'sdk', 'ide', 'json', 'xml', 'html', 'css',
    'sql', 'nosql', 'crud', 'http', 'https', 'url', 'uri',
    # Common words sometimes flagged
    'analytics', 'realtime', 'dataset', 'datasets', 'metadata', 'workflow', 'workflows',
    'backend', 'frontend', 'middleware', 'blockchain', 'cryptocurrency',
    'monitored', 'encompasses', 'sensors', 'streamline', 'outcomes', 'utilize',
    'leverages', 'optimizes', 'facilitates', 'integrates', 'customizable',
    # Academic/formal terms
    'aforementioned', 'whereby', 'thereof', 'henceforth', 'notwithstanding',
    # Plurals and common variations
    'analyses', 'criteria', 'phenomena', 'indices', 'matrices'
}


class GrammarService:
    """Service for grammar and language analysis."""
    
    def __init__(self):
        self.nlp = None
        self.whitelist: Set[str] = WHITELIST_TERMS
        if GRAMMAR_AVAILABLE and settings.languagetool_enabled:
            try:
                # Try to load spaCy model
                self.nlp = spacy.load('en_core_web_sm')
            except OSError:
                print("Warning: spaCy model not found. Run: python -m spacy download en_core_web_sm")
            except Exception as e:
                print(f"Warning: Grammar checking initialization failed: {e}")
    
    def analyze(self, text: str) -> GrammarAnalysis:
        """
        Analyze text for grammar and readability.
        
        Args:
            text: Text to analyze
            
        Returns:
            GrammarAnalysis: Analysis results
        """
        # Grammar check
        errors = []
        error_categories = {}
        
        if GRAMMAR_AVAILABLE:
            # Check spelling with TextBlob (with improvements)
            blob = TextBlob(text)
            words = text.split()
            word_offset = 0
            
            for i, word in enumerate(words):
                # Clean word for spell check
                clean_word = re.sub(r'[^a-zA-Z]', '', word)
                clean_lower = clean_word.lower()
                
                # Skip if word is in whitelist, too short, or starts with capital (likely proper noun)
                if clean_word and len(clean_word) > 2:
                    # Skip whitelisted terms
                    if clean_lower in self.whitelist:
                        word_offset += len(word) + 1
                        continue
                    
                    # Skip proper nouns (capitalized words not at sentence start)
                    if clean_word[0].isupper() and i > 0:
                        word_offset += len(word) + 1
                        continue
                    
                    # Skip acronyms (all caps, 2-5 letters)
                    if clean_word.isupper() and 2 <= len(clean_word) <= 5:
                        word_offset += len(word) + 1
                        continue
                    
                    corrected = str(TextBlob(clean_word).correct())
                    corrected_lower = corrected.lower()
                    
                    # Only flag if correction is significantly different and not in whitelist
                    if corrected_lower != clean_lower and corrected_lower not in self.whitelist:
                        # Additional check: skip if the correction seems unreasonable
                        # (e.g., very different length or completely different word)
                        if abs(len(corrected) - len(clean_word)) <= 3:
                            error = GrammarError(
                                message=f"Possible spelling error: '{clean_word}'",
                                rule_id="SPELLING",
                                category="Spelling",
                                offset=word_offset,
                                length=len(clean_word),
                                context=f"...{' '.join(words[max(0,i-2):min(len(words),i+3)])}...",
                                suggestions=[corrected]
                            )
                            errors.append(error)
                            error_categories['Spelling'] = error_categories.get('Spelling', 0) + 1
                
                word_offset += len(word) + 1
            
            # Check grammar with spaCy if available
            if self.nlp:
                doc = self.nlp(text)
                
                # Check for common grammar issues
                for sent in doc.sents:
                    # Check for sentences without verbs
                    has_verb = any(token.pos_ == 'VERB' for token in sent)
                    if not has_verb and len(sent) > 3:
                        error = GrammarError(
                            message="Sentence may be missing a verb",
                            rule_id="NO_VERB",
                            category="Grammar",
                            offset=sent.start_char,
                            length=len(sent.text),
                            context=sent.text,
                            suggestions=[]
                        )
                        errors.append(error)
                        error_categories['Grammar'] = error_categories.get('Grammar', 0) + 1
                    
                    # Check for repeated words
                    tokens = [t.text.lower() for t in sent if not t.is_punct]
                    for i in range(len(tokens) - 1):
                        if tokens[i] == tokens[i+1] and len(tokens[i]) > 2:
                            error = GrammarError(
                                message=f"Repeated word: '{tokens[i]}'",
                                rule_id="REPEATED_WORD",
                                category="Style",
                                offset=sent.start_char,
                                length=len(sent.text),
                                context=sent.text,
                                suggestions=[]
                            )
                            errors.append(error)
                            error_categories['Style'] = error_categories.get('Style', 0) + 1
                            break
        
        # Readability score
        readability = self._calculate_readability(text)
        
        # Calculate score (0-100)
        # Fewer errors = higher score
        total_words = len(text.split())
        error_rate = len(errors) / max(total_words, 1) * 100
        
        # Score formula: Start with 100, subtract penalties
        grammar_score = max(0, 100 - (error_rate * 10))
        
        # Factor in readability (Flesch Reading Ease: 0-100, higher is easier)
        # Combine grammar and readability
        final_score = (grammar_score * 0.7) + (readability * 0.3)
        
        return GrammarAnalysis(
            total_errors=len(errors),
            error_categories=error_categories,
            errors=errors[:50],  # Limit to first 50 errors for display
            readability_score=readability,
            score=round(final_score, 2)
        )
    
    def _calculate_readability(self, text: str) -> float:
        """
        Calculate readability score.
        
        Args:
            text: Text to analyze
            
        Returns:
            float: Readability score (0-100)
        """
        try:
            # Flesch Reading Ease (0-100, higher is better)
            flesch = textstat.flesch_reading_ease(text)
            # Normalize to 0-100 range (some texts can be negative)
            return max(0, min(100, flesch))
        except Exception:
            return 50.0  # Default middle score


grammar_service = GrammarService()
