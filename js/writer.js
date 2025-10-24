// --- 1. GLOBAL SETUP ---
const token = localStorage.getItem('access_token');
const API_URL = 'http://localhost:3000'; // Your backend URL

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
if (!token) {
    window.location.href = 'login.html';
}

// --- 3. PAGE LOAD LOGIC (Check for Edit) ---
document.addEventListener('DOMContentLoaded', () => {
    // This is how we read the URL, e.g., "writer.html?id=123"
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');

    if (storyId) {
        // If an ID exists, we are in "Edit Mode"
        currentStoryId = storyId;
        writerTitle.textContent = 'Edit Your Story';
        deleteButton.style.display = 'block'; // Show delete button
        loadStoryForEditing(storyId);
    } else {
        // We are in "Create Mode"
        writerTitle.textContent = 'Write a New Story';
    }
});

// 4. LOAD STORY DATA (if editing)
async function loadStoryForEditing(id) {
    const response = await fetch(`${API_URL}/stories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        alert('Could not load story.');
        window.location.href = 'index.html';
        return;
    }
    const story = await response.json();
    
    // Fill the form with the data
    storyIdInput.value = story.id;
    storyTitleInput.value = story.title;
    storyContentInput.value = story.content;
    storyCoverInput.value = story.cover_image_url;
}

// --- 5. SAVE/UPDATE STORY ---
storyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const storyData = {
        title: storyTitleInput.value,
        content: storyContentInput.value,
        cover_image_url: storyCoverInput.value
    };
    
    let url = `${API_URL}/stories`;
    let method = 'POST'; // Create new

    if (currentStoryId) {
        // If we have an ID, we are UPDATING (PUT)
        url = `${API_URL}/stories/${currentStoryId}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
    });

    if (response.ok) {
        alert('Story saved!');
        // Go back to the dashboard to see the list
        window.location.href = 'index.html';
    } else {
        alert('Failed to save story.');
    }
});

// --- 6. DELETE STORY ---
deleteButton.addEventListener('click', async () => {
    if (!currentStoryId || !confirm('Are you sure you want to delete this story?')) {
        return;
    }

    const response = await fetch(`${API_URL}/stories/${currentStoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        alert('Story deleted.');
        window.location.href = 'index.html';
    } else {
        alert('Failed to delete story.');
    }
});

// --- 7. LOGOUT ---
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
});