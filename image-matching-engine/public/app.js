document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

let currentSuggestionId = null;

async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        const list = document.getElementById('posts-list');
        list.innerHTML = '';
        
        posts.forEach(post => {
            const el = document.createElement('div');
            el.className = 'post-card';
            el.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            `;
            el.onclick = () => selectPost(post.id, el);
            list.appendChild(el);
        });
    } catch (err) {
        console.error("Failed to load posts", err);
    }
}

async function selectPost(id, element) {
    // UI Update
    document.querySelectorAll('.post-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('result-card').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');

    try {
        const response = await fetch(`/posts/${id}/images`);
        const data = await response.json();
        
        document.getElementById('loading-state').classList.add('hidden');
        renderSuggestion(data.suggestion);
        currentSuggestionId = data.suggestionId; // Backend should return suggestion ID
    } catch (err) {
        console.error(err);
        document.getElementById('loading-state').classList.add('hidden');
        alert('Error analyzing match. See console.');
    }
}

function renderSuggestion(suggestion) {
    const card = document.getElementById('result-card');
    card.classList.remove('hidden', 'rejected-card');
    
    const statusBadge = document.getElementById('match-status');
    statusBadge.textContent = suggestion.status;
    statusBadge.className = `badge ${suggestion.status.toLowerCase()}`;

    if (suggestion.status === 'REJECTED') {
        card.classList.add('rejected-card');
    }

    document.getElementById('match-score').textContent = 
        suggestion.score ? `${(suggestion.score * 100).toFixed(1)}% Match` : '';

    document.getElementById('match-reason').textContent = suggestion.reason;

    const imgEl = document.getElementById('candidate-image');
    if (suggestion.candidate) {
        // Build image URL 
        imgEl.src = `/images/${suggestion.candidate.filename}`;
        document.getElementById('meta-subject').textContent = suggestion.candidate.subject;
        document.getElementById('meta-confidence').textContent = 
            `${(suggestion.candidate.confidence * 100).toFixed(1)}%`;
        
        document.querySelector('.metadata').classList.remove('hidden');
        imgEl.parentElement.classList.remove('hidden');
    } else {
        imgEl.parentElement.classList.add('hidden');
        document.querySelector('.metadata').classList.add('hidden');
    }

    // Buttons
    const btnApprove = document.getElementById('btn-approve');
    const btnReject = document.getElementById('btn-reject');
    
    if (suggestion.status === 'REJECTED' || !suggestion.candidate) {
        btnApprove.disabled = true;
        btnReject.disabled = true;
    } else {
        btnApprove.disabled = false;
        btnReject.disabled = false;
        
        btnApprove.onclick = () => handleAction('approve');
        btnReject.onclick = () => handleAction('reject');
    }
}

async function handleAction(action) {
    if (!currentSuggestionId) return;
    
    try {
        const res = await fetch(`/suggestions/${currentSuggestionId}/${action}`, { method: 'POST' });
        const data = await res.json();
        alert(data.message);
        
        document.getElementById('btn-approve').disabled = true;
        document.getElementById('btn-reject').disabled = true;
    } catch (err) {
        console.error(err);
    }
}
