// API Base URL
const API_BASE = window.location.origin;

// Global state
let currentDocumentId = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadStatus = document.getElementById('uploadStatus');
const uploadSection = document.getElementById('uploadSection');
const evaluationSection = document.getElementById('evaluationSection');
const resultsSection = document.getElementById('resultsSection');
const documentInfo = document.getElementById('documentInfo');
const promptText = document.getElementById('promptText');
const evaluateBtn = document.getElementById('evaluateBtn');
const evaluationStatus = document.getElementById('evaluationStatus');
const exportBtn = document.getElementById('exportBtn');
const newDocBtn = document.getElementById('newDocBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Evaluate button
    evaluateBtn.addEventListener('click', handleEvaluate);
    
    // Export button
    exportBtn.addEventListener('click', handleExport);
    
    // New document button
    newDocBtn.addEventListener('click', resetToUpload);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showStatus(uploadStatus, 'error', 'Invalid file type. Please upload a PDF or DOCX file.');
        return;
    }
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showStatus(uploadStatus, 'error', 'File too large. Maximum size is 10MB.');
        return;
    }
    
    // Upload file
    await uploadFile(file);
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Show progress
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';
    
    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
            }
        }, 100);
        
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        const data = await response.json();
        currentDocumentId = data.id;
        
        progressText.textContent = 'Upload Complete!';
        showStatus(uploadStatus, 'success', `Document uploaded successfully: ${data.filename}`);
        
        // Show evaluation section
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            showEvaluationSection(data);
        }, 1000);
        
    } catch (error) {
        progressFill.style.width = '0%';
        uploadProgress.style.display = 'none';
        showStatus(uploadStatus, 'error', `Error: ${error.message}`);
    }
}

function showEvaluationSection(document) {
    evaluationSection.style.display = 'block';
    
    documentInfo.innerHTML = `
        <p><strong>Filename:</strong> ${document.filename}</p>
        <p><strong>File Type:</strong> ${document.file_type.toUpperCase()}</p>
        <p><strong>File Size:</strong> ${formatFileSize(document.file_size)}</p>
        <p><strong>Status:</strong> ${document.status}</p>
        <p><strong>Uploaded:</strong> ${new Date(document.uploaded_at).toLocaleString()}</p>
    `;
    
    // Scroll to evaluation section
    evaluationSection.scrollIntoView({ behavior: 'smooth' });
}

async function handleEvaluate() {
    if (!currentDocumentId) return;
    
    evaluateBtn.disabled = true;
    evaluateBtn.textContent = 'Evaluating...';
    showStatus(evaluationStatus, 'info', 'Running evaluation. This may take a moment...');
    
    try {
        const requestBody = {
            prompt_text: promptText.value.trim() || null
        };
        
        const response = await fetch(`${API_BASE}/api/evaluate/${currentDocumentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Evaluation failed');
        }
        
        const results = await response.json();
        
        showStatus(evaluationStatus, 'success', 'Evaluation completed successfully!');
        
        // Show results
        setTimeout(() => {
            displayResults(results);
        }, 500);
        
    } catch (error) {
        showStatus(evaluationStatus, 'error', `Error: ${error.message}`);
        evaluateBtn.disabled = false;
        evaluateBtn.textContent = 'Run Evaluation';
    }
}

function displayResults(results) {
    resultsSection.style.display = 'block';
    
    // Overall score
    document.getElementById('overallScore').textContent = results.overall_score.toFixed(2);
    document.getElementById('letterGrade').textContent = `Grade: ${results.letter_grade}`;
    
    // Set grade color
    const gradeElement = document.getElementById('letterGrade');
    const gradeColors = {
        'A': '#10b981',
        'B': '#3b82f6',
        'C': '#f59e0b',
        'D': '#ef4444',
        'F': '#991b1b'
    };
    gradeElement.style.background = gradeColors[results.letter_grade] || 'rgba(255, 255, 255, 0.2)';
    
    // Grammar
    document.getElementById('grammarScore').textContent = results.grammar.score.toFixed(2);
    document.getElementById('grammarDetails').innerHTML = `
        Total Errors: ${results.grammar.total_errors}<br>
        Readability: ${results.grammar.readability_score.toFixed(2)}
    `;
    
    // Vocabulary
    document.getElementById('vocabularyScore').textContent = results.vocabulary.score.toFixed(2);
    document.getElementById('vocabularyDetails').innerHTML = `
        Lexical Diversity: ${results.vocabulary.lexical_diversity.toFixed(4)}<br>
        Avg Word Length: ${results.vocabulary.average_word_length.toFixed(2)}<br>
        Unique Words: ${results.vocabulary.unique_words}
    `;
    
    // Topic Relevance
    document.getElementById('topicScore').textContent = results.topic_relevance.score.toFixed(2);
    document.getElementById('topicDetails').innerHTML = `
        Similarity: ${(results.topic_relevance.similarity_score * 100).toFixed(2)}%<br>
        ${results.topic_relevance.notes}
    `;
    
    // Coherence
    document.getElementById('coherenceScore').textContent = results.coherence.score.toFixed(2);
    document.getElementById('coherenceDetails').innerHTML = `
        Paragraphs: ${results.coherence.paragraph_count}<br>
        Avg Sentences/Para: ${results.coherence.avg_sentences_per_paragraph.toFixed(2)}<br>
        Transition Words: ${results.coherence.transition_word_count}
    `;
    
    // Plagiarism
    document.getElementById('plagiarismScore').textContent = results.plagiarism.score.toFixed(2);
    document.getElementById('plagiarismDetails').innerHTML = `
        Similarity: ${results.plagiarism.similarity_percentage.toFixed(2)}%<br>
        Matches Found: ${results.plagiarism.matched_segments.length}
    `;
    
    // Grammar errors
    if (results.grammar.errors && results.grammar.errors.length > 0) {
        const errorsSection = document.getElementById('errorsSection');
        const errorsList = document.getElementById('errorsList');
        errorsSection.style.display = 'block';
        
        errorsList.innerHTML = results.grammar.errors.slice(0, 10).map((error, index) => `
            <div class="error-item">
                <div class="error-message">${index + 1}. ${error.message}</div>
                <span class="error-category">${error.category}</span>
                ${error.suggestions.length > 0 ? `
                    <div class="error-suggestions">
                        <strong>Suggestions:</strong> ${error.suggestions.join(', ')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // Feedback
    document.getElementById('feedbackText').textContent = results.feedback;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

async function handleExport() {
    if (!currentDocumentId) return;
    
    exportBtn.disabled = true;
    exportBtn.textContent = '📥 Generating PDF...';
    
    try {
        const response = await fetch(`${API_BASE}/api/export/${currentDocumentId}`);
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evaluation_report_${currentDocumentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        exportBtn.textContent = '📥 Download PDF Report';
        exportBtn.disabled = false;
        
    } catch (error) {
        alert('Failed to export report: ' + error.message);
        exportBtn.textContent = '📥 Download PDF Report';
        exportBtn.disabled = false;
    }
}

function resetToUpload() {
    currentDocumentId = null;
    fileInput.value = '';
    promptText.value = '';
    uploadProgress.style.display = 'none';
    uploadStatus.innerHTML = '';
    evaluationSection.style.display = 'none';
    resultsSection.style.display = 'none';
    evaluationStatus.innerHTML = '';
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = 'Run Evaluation';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStatus(element, type, message) {
    element.innerHTML = `<div class="status-${type}">${message}</div>`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
