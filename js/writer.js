// --- 1. GLOBAL SETUP ---
const token = localStorage.getItem('access_token');
// !!! IMPORTANT: REPLACE WITH YOUR LIVE RENDER URL BEFORE FINAL DEPLOYMENT !!!
const API_URL = 'https://dads-app-backend.onrender.com'; // Use your Render URL or 'http://localhost:3000' for local testing
const headers = { 'Authorization': `Bearer ${token}` };

// Get all the HTML elements
const storyForm = document.getElementById('story-form');
const storyIdInput = document.getElementById('story-id');
const storyTitleInput = document.getElementById('story-title');
const storyCoverInput = document.getElementById('story-cover');
const storyContentInput = document.getElementById('story-content');
const writerTitle = document.getElementById('writer-title');
const deleteButton = document.getElementById('delete-story-button');
const logoutButton = document.getElementById('logout-button');

let currentStoryId = null;

// --- 2. SECURITY CHECK ---
if (!token) { window.location.href = 'login.html'; }

// --- 3. MATERIALIZE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize Materialize Textarea (for auto-resize)
        const textareas = document.querySelectorAll('.materialize-textarea');
        if (textareas.length > 0) M.textareaAutoResize(textareas[0]); // Initialize the specific textarea

        // Initialize labels
        M.updateTextFields();

        loadPageData(); // Start page load logic AFTER initializing
    } catch (error) {
        console.error("Materialize Init Error (Writer):", error);
        alert("Error initializing page components. Please refresh.");
    }
});

// --- 4. PAGE LOAD LOGIC ---
function loadPageData() {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');

    if (storyId) {
        currentStoryId = storyId;
        writerTitle.textContent = 'Edit Your Story';
        deleteButton.style.display = 'inline-block';
        loadStoryForEditing(storyId);
    } else {
        writerTitle.textContent = 'Write a New Story';
         M.updateTextFields(); // Ensure labels are correct for new story
    }
}

// 5. LOAD STORY DATA (if editing)
async function loadStoryForEditing(id) {
    try {
        const response = await fetch(`${API_URL}/stories/${id}`, { headers });
        if (!response.ok) throw new Error('Could not load story');

        const story = await response.json();

        // Fill the form
        storyIdInput.value = story.id;
        storyTitleInput.value = story.title;
        storyContentInput.value = story.content || '';
        storyCoverInput.value = story.cover_image_url || '';

        // Update labels and textarea AFTER filling inputs
        M.updateTextFields();
        if (story.content) M.textareaAutoResize(storyContentInput);

    } catch (error) {
        console.error("Error loading story:", error);
        M.toast({html: `Error loading story: ${error.message}`, classes: 'red'});
    }
}

// --- 6. SAVE/UPDATE STORY ---
storyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const storyData = {
        title: storyTitleInput.value,
        content: storyContentInput.value,
        cover_image_url: storyCoverInput.value || null
    };

    let url = `${API_URL}/stories`;
    let method = 'POST';
    if (currentStoryId) {
        url = `${API_URL}/stories/${currentStoryId}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(storyData) });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

        M.toast({html: 'Story saved!', classes: 'green'});
        window.location.href = 'index.html#story-list-view'; // Go back to dashboard story section

    } catch (error) {
        console.error('Failed to save story:', error);
        M.toast({html: `Failed to save story: ${error.message}`, classes: 'red'});
    }
});

// --- 7. DELETE STORY ---
deleteButton.addEventListener('click', async () => {
    if (!currentStoryId || !confirm('Are you sure? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/stories/${currentStoryId}`, { method: 'DELETE', headers });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

        M.toast({html: 'Story deleted.', classes: 'green'});
        window.location.href = 'index.html#story-list-view';

    } catch (error) {
        console.error('Failed to delete story:', error);
        M.toast({html: `Failed to delete story: ${error.message}`, classes: 'red'});
    }
});

// --- 8. LOGOUT ---
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
});

// NOTE: Initial load logic is now triggered by DOMContentLoaded