// --- 1. GLOBAL SETUP ---
const token = localStorage.getItem('access_token');
const API_URL = 'https://dads-app-backend.onrender.com'; // Your backend URL (CHANGE FOR DEPLOYMENT)
const headers = { 'Authorization': `Bearer ${token}` };

// Page View Sections
const homeView = document.getElementById('home-view');
const expenseTrackerView = document.getElementById('expense-tracker-view');
const savingsTrackerView = document.getElementById('savings-tracker-view');
const storyListView = document.getElementById('story-list-view');
const views = [homeView, expenseTrackerView, savingsTrackerView, storyListView];

// Nav Links
const homeLink = document.getElementById('home-link');
const trackerLink = document.getElementById('tracker-link');
const savingsLink = document.getElementById('savings-link');
const storiesLink = document.getElementById('stories-link');
const navLinks = [trackerLink, savingsLink, storiesLink];

// Common Elements
const logoutButton = document.getElementById('logout-button');
const welcomeMessage = document.getElementById('welcome-message');
const quoteHomeEl = document.getElementById('quote-home');
const quoteTrackerEl = document.getElementById('quote-tracker');
const quoteSavingsEl = document.getElementById('quote-savings');
const userDisplayNameEl = document.getElementById('user-display-name');

// Expense Elements
const addExpenseModalButton = document.getElementById('add-expense-modal-button');
const expenseModal = document.getElementById('expense-modal');
const expenseForm = document.getElementById('expense-form');
const expenseListEl = document.getElementById('expense-list');
const weeklyTotalExpenseEl = document.getElementById('weekly-total-expense');
const monthlyTotalExpenseEl = document.getElementById('monthly-total-expense');
const yearlyTotalExpenseEl = document.getElementById('yearly-total-expense');
const expenseChartCanvas = document.getElementById('expenseChart').getContext('2d');
let expenseChart = null;

// Saving Elements
const addSavingModalButton = document.getElementById('add-saving-modal-button');
const savingModal = document.getElementById('saving-modal');
const savingForm = document.getElementById('saving-form');
const savingListEl = document.getElementById('saving-list');
const weeklyTotalSavingEl = document.getElementById('weekly-total-saving');
const monthlyTotalSavingEl = document.getElementById('monthly-total-saving');
const yearlyTotalSavingEl = document.getElementById('yearly-total-saving');
const savingChartCanvas = document.getElementById('savingChart').getContext('2d');
let savingChart = null;

// Story Elements
const storyListEl = document.getElementById('story-list');

// --- 2. SECURITY CHECK ---
if (!token) {
    window.location.href = 'login.html';
}

// --- 3. QUOTES ---
const quotes = [
    "சிறு துளி பெரு வெள்ளம்",
    "செலவு செய்ய தெரிஞ்சவன் சாதாரணன்; சேமிக்க தெரிஞ்சவன் சாமர்த்தியசாலி.",
    "வாழ்க்கை வெற்றி கடையில் கிடைக்காது, ஒவ்வொரு ரூபாயும் கற்றுக் கொடுக்கிறது.",
    "பணம் சேமிக்கிறவன் ஏழை இல்ல; எதிர்காலத்தை தயார் பண்ணிறவன்.",
    "செலவு பத்தி பயப்படாதே, ஆனால் செலவுல பயன் இருக்கணும். இன்று சிந்தித்து செலவு பண்ணினா, நாளை சிரித்து வாழலாம்.",
];
function displayQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = `"${quotes[randomIndex]}"`;
    quoteHomeEl.textContent = quote;
    quoteTrackerEl.textContent = quote;
    quoteSavingsEl.textContent = "சேமிப்பு பழக்கம் வாழ்க்கையின் வளம்.";
}

// --- 4. NAVIGATION LOGIC (SPA) ---
function showView(viewToShow) {
    views.forEach(view => view.classList.add('hidden'));
    viewToShow.classList.remove('hidden');

    navLinks.forEach(link => link.classList.remove('active'));
    let activeLink = null;
    if (viewToShow === expenseTrackerView) activeLink = trackerLink;
    else if (viewToShow === savingsTrackerView) activeLink = savingsLink;
    else if (viewToShow === storyListView) activeLink = storiesLink;

    if(activeLink) activeLink.classList.add('active');

    if(viewToShow === homeView) { document.body.classList.add('royal-background'); }
    else { document.body.classList.remove('royal-background'); }
}

homeLink.addEventListener('click', (e) => { e.preventDefault(); showView(homeView); });
trackerLink.addEventListener('click', (e) => { e.preventDefault(); showView(expenseTrackerView); });
savingsLink.addEventListener('click', (e) => { e.preventDefault(); showView(savingsTrackerView); });
storiesLink.addEventListener('click', (e) => { e.preventDefault(); showView(storyListView); });

// --- 5. MODAL CONTROL ---
addExpenseModalButton.addEventListener('click', () => {
    expenseForm.reset();
    document.getElementById('expense-id').value = '';
    document.getElementById('expense-modal-title').textContent = 'Add New Expense';
    openModal('expense-modal');
});
addSavingModalButton.addEventListener('click', () => {
    savingForm.reset();
    document.getElementById('saving-id').value = '';
    document.getElementById('saving-modal-title').textContent = 'Add New Saving';
    openModal('saving-modal');
});
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) { closeModal(event.target.id); }
});

// --- 6. LOGOUT ---
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
});

// --- 7. DATA STORAGE ---
let allExpenses = [];
let allSavings = [];
let allStories = [];
let currentUser = null;

// --- MOVED THIS FUNCTION UP ---
// --- 8. UPDATE WELCOME MESSAGE ---
function updateWelcomeMessage() {
    // Check if currentUser exists before accessing properties
    const name = currentUser?.user_metadata?.full_name;
    if (name) {
        welcomeMessage.textContent = `Welcome, ${name}!`;
        userDisplayNameEl.textContent = `Hi, ${name.split(' ')[0]}!`; // Show first name in nav
    } else {
        welcomeMessage.textContent = 'Welcome!';
        userDisplayNameEl.textContent = '';
    }
}


// --- 9. DELETE FUNCTIONS ---
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        await fetchAndUpdateExpenses(); // Refetch and update
    } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('Failed to delete expense.');
    }
}

async function deleteSaving(id) {
     if (!confirm('Are you sure you want to delete this saving entry?')) return;
     try {
        const response = await fetch(`${API_URL}/savings/${id}`, { method: 'DELETE', headers });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        await fetchAndUpdateSavings(); // Refetch and update
     } catch (error) {
        console.error('Failed to delete saving:', error);
        alert('Failed to delete saving.');
     }
}

// --- 10. DISPLAY LIST (Generic) ---
function displayList(items, listElement, deleteFunction, type) {
    listElement.innerHTML = '';
    const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedItems.length === 0) {
        listElement.innerHTML = `<li>No ${type}s recorded yet.</li>`; return;
    }

    sortedItems.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        const categoryText = item.category ? `(${item.category})` : '';
        li.innerHTML = `
            <div class="content">
                <span class="description">${item.description} ${categoryText}</span>
                <span class="date">${new Date(item.date).toLocaleDateString()}</span>
            </div>
            <span class="amount">${type === 'expense' ? '-' : '+'}₹${item.amount.toFixed(2)}</span>
        `;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteFunction(item.id);
        li.appendChild(deleteBtn);
        listElement.appendChild(li);
    });
}

// --- 11. CALCULATE STATS (Generic) ---
function calculateAndDisplayStats(items, type) {
    const now = new Date();
    let startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
    let weeklyTotal = 0, monthlyTotal = 0, yearlyTotal = 0;

    for (const item of items) {
        const itemDate = new Date(item.date); itemDate.setHours(0,0,0,0);
        if (itemDate.getFullYear() === now.getFullYear()) {
            yearlyTotal += item.amount;
            if (itemDate.getMonth() === now.getMonth()) {
                monthlyTotal += item.amount;
                if (itemDate >= startOfWeek) { weeklyTotal += item.amount; }
            }
        }
    }
    const weeklyEl = type === 'expense' ? weeklyTotalExpenseEl : weeklyTotalSavingEl;
    const monthlyEl = type === 'expense' ? monthlyTotalExpenseEl : monthlyTotalSavingEl;
    const yearlyEl = type === 'expense' ? yearlyTotalExpenseEl : yearlyTotalSavingEl;
    weeklyEl.textContent = `₹${weeklyTotal.toFixed(2)}`;
    monthlyEl.textContent = `₹${monthlyTotal.toFixed(2)}`;
    yearlyEl.textContent = `₹${yearlyTotal.toFixed(2)}`;
}

// --- 12. UPDATE CHART (Generic) ---
function updateChart(items, canvasContext, chartInstanceRef, type) {
    const categoryTotals = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + item.amount;
        return acc;
    }, {});
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const backgroundColors = [ '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#C9CBCF', '#3CBA9F', '#E8C3B9', '#B9E8C3', '#C3B9E8' ];
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

    const chartData = { labels, datasets: [{ label: `${type.charAt(0).toUpperCase() + type.slice(1)} by Category`, data, backgroundColor: backgroundColors.slice(0, labels.length), borderColor: borderColors.slice(0, labels.length), borderWidth: 1 }] };

    let currentChart = (type === 'expense') ? expenseChart : savingChart;

    if (currentChart) {
        currentChart.data = chartData;
        currentChart.update();
    } else {
        currentChart = new Chart(canvasContext, {
            type: 'pie', data: chartData,
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: labels.length > 0 && labels.length < 10 }, /* Hide legend if too many items */ tooltip: { callbacks: { label: (context) => `${context.label}: ₹${context.parsed.toFixed(2)}` }}}}
        });
        if(type === 'expense') expenseChart = currentChart; else savingChart = currentChart;
    }
}

// --- 13. DISPLAY STORY LIST ---
function displayStoryList(stories) {
    storyListEl.innerHTML = '';
    if (stories.length === 0) { storyListEl.innerHTML = `<p>You haven't written any stories yet.</p>`; }
    stories.forEach(story => {
        const card = document.createElement('a'); card.className = 'story-card'; card.href = `writer.html?id=${story.id}`;
        if (story.cover_image_url) { card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(${story.cover_image_url})`; }
        else { card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))`; }
        card.innerHTML = `<h4>${story.title}</h4><p>${story.content || 'No content...'}</p>`;
        storyListEl.appendChild(card);
    });
}


// --- 14. DATA PROCESSING FUNCTIONS ---
function processExpenseData(expenses) {
    displayList(expenses, expenseListEl, deleteExpense, 'expense');
    calculateAndDisplayStats(expenses, 'expense');
    updateChart(expenses, expenseChartCanvas, expenseChart, 'expense');
}
function processSavingsData(savings) {
    displayList(savings, savingListEl, deleteSaving, 'saving');
    calculateAndDisplayStats(savings, 'saving');
    updateChart(savings, savingChartCanvas, savingChart, 'saving');
}

// --- 15. FETCH AND UPDATE FUNCTIONS ---
async function fetchAndUpdateExpenses() {
    try {
        const res = await fetch(`${API_URL}/expenses`, { headers });
        if (!res.ok) throw new Error('Failed to fetch expenses');
        allExpenses = await res.json();
        processExpenseData(allExpenses);
    } catch (error) {
        console.error("Error fetching/updating expenses:", error);
        alert("Could not update expenses list.");
    }
}
async function fetchAndUpdateSavings() {
     try {
        const res = await fetch(`${API_URL}/savings`, { headers });
        if (!res.ok) throw new Error('Failed to fetch savings');
        allSavings = await res.json();
        processSavingsData(allSavings);
    } catch (error) {
        console.error("Error fetching/updating savings:", error);
        alert("Could not update savings list.");
    }
}

// --- 16. ADD ITEM HANDLERS ---
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('expense-description').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    if (!category) { alert('Please select a category.'); return; }
    try {
        const response = await fetch(`${API_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ description, amount: parseFloat(amount), date, category }) });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        expenseForm.reset();
        closeModal('expense-modal');
        await fetchAndUpdateExpenses();
    } catch (error) {
        console.error('Failed to add expense:', error);
        alert('Failed to add expense.');
    }
});

savingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('saving-description').value;
    const amount = document.getElementById('saving-amount').value;
    const date = document.getElementById('saving-date').value;
    const category = document.getElementById('saving-category').value;
     try {
        const response = await fetch(`${API_URL}/savings`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ description, amount: parseFloat(amount), date, category }) });
         if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        savingForm.reset();
        closeModal('saving-modal');
        await fetchAndUpdateSavings();
    } catch (error) {
        console.error('Failed to add saving:', error);
        alert('Failed to add saving.');
    }
});

// --- 17. INITIAL APP LOAD ---
// This function fetches all data when the app starts
async function initializeApp() {
    displayQuote(); // Show quote first
    try {
        // Fetch everything concurrently
        const [userRes, expensesRes, savingsRes, storiesRes] = await Promise.all([
            fetch(`${API_URL}/me`, { headers }), fetch(`${API_URL}/expenses`, { headers }),
            fetch(`${API_URL}/savings`, { headers }), fetch(`${API_URL}/stories`, { headers })
        ]);

        // Check auth *first*
        if (!userRes.ok) throw new Error('Authentication failed');
        currentUser = await userRes.json();

        // Check other responses *after* auth is confirmed
        if (!expensesRes.ok) console.error('Failed to fetch expenses:', await expensesRes.text()); // Log error
        if (!savingsRes.ok) console.error('Failed to fetch savings:', await savingsRes.text()); // Log error
        if (!storiesRes.ok) console.error('Failed to fetch stories:', await storiesRes.text()); // Log error

        // Process data even if some fetches failed (graceful degradation)
        allExpenses = expensesRes.ok ? await expensesRes.json() : [];
        allSavings = savingsRes.ok ? await savingsRes.json() : [];
        allStories = storiesRes.ok ? await storiesRes.json() : [];

        // Update UI
        updateWelcomeMessage(); // <-- Now defined before being called
        processExpenseData(allExpenses);
        processSavingsData(allSavings);
        displayStoryList(allStories);
        showView(homeView); // Start on home view

    } catch (error) {
        console.error("Initialization Error:", error);
        if (error.message === 'Authentication failed') { localStorage.removeItem('access_token'); window.location.href = 'login.html'; }
        else { alert(`Error loading data: ${error.message}. Please try again later.`); }
    }
}

// --- 18. RUN ---
initializeApp(); // Start the application