"""Pydantic models for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    """Supported document types."""
    PDF = "pdf"
    DOCX = "docx"


class DocumentStatus(str, Enum):
    """Document processing status."""
    UPLOADED = "uploaded"
    PARSING = "parsing"
    PARSED = "parsed"
    EVALUATING = "evaluating"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentUploadResponse(BaseModel):
    """Response after document upload."""
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    uploaded_at: datetime


class GrammarError(BaseModel):
    """Grammar error details."""
    message: str
    rule_id: str
    category: str
    offset: int
    length: int
    context: str
    suggestions: List[str] = []


class GrammarAnalysis(BaseModel):
    """Grammar analysis results."""
    total_errors: int
    error_categories: Dict[str, int]
    errors: List[GrammarError]
    readability_score: float
    score: float  # 0-100


class VocabularyAnalysis(BaseModel):
    """Vocabulary analysis results."""
    lexical_diversity: float
    average_word_length: float
    unique_words: int
    total_words: int
    score: float  # 0-100


class TopicRelevanceAnalysis(BaseModel):
    """Topic relevance analysis results."""
    similarity_score: float  # Cosine similarity
    score: float  # 0-100
    notes: str = ""


class CoherenceAnalysis(BaseModel):
    """Coherence and structure analysis results."""
    paragraph_count: int
    avg_sentences_per_paragraph: float
    sentence_length_variance: float
    transition_word_count: int
    score: float  # 0-100


class PlagiarismMatch(BaseModel):
    """Plagiarism match details."""
    matched_text: str
    source_document_id: Optional[str]
    similarity: float


class PlagiarismAnalysis(BaseModel):
    """Plagiarism detection results."""
    similarity_percentage: float
    matched_segments: List[PlagiarismMatch]
    score: float  # 0-100 (higher is better - less plagiarism)


class EvaluationResults(BaseModel):
    """Complete evaluation results."""
    document_id: str
    overall_score: float
    letter_grade: str
    grammar: GrammarAnalysis
    vocabulary: VocabularyAnalysis
    topic_relevance: TopicRelevanceAnalysis
    coherence: CoherenceAnalysis
    plagiarism: PlagiarismAnalysis
    evaluated_at: datetime
    feedback: str = ""


class DocumentInfo(BaseModel):
    """Document information with parsed data."""
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    uploaded_at: datetime
    word_count: Optional[int] = None
    page_count: Optional[int] = None
    extracted_text: Optional[str] = None
    evaluation_results: Optional[EvaluationResults] = None
