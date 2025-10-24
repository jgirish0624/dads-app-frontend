// --- 1. GLOBAL SETUP ---
const token = localStorage.getItem('access_token');
// !!! IMPORTANT: Use 'http://localhost:3000' for local testing.
// !!! CHANGE to your live Render URL before final Vercel deployment !!!
const API_URL = 'https://dads-app-backend.onrender.com'; // Or your Render URL
const headers = { 'Authorization': `Bearer ${token}` };

// Global variables for elements - Initialized as null, assigned in DOMContentLoaded
let homeView = null, expenseTrackerView = null, savingsTrackerView = null, storyListView = null;
let homeLink = null, trackerLink = null, savingsLink = null, storiesLink = null, trackerLinkMobile = null, savingsLinkMobile = null, storiesLinkMobile = null;
let views = [], navLinks = [];
let logoutButton = null, logoutButtonMobile = null, welcomeMessage = null, quoteHomeEl = null, quoteTrackerEl = null, quoteSavingsEl = null, userDisplayNameEl = null;
let addExpenseModalButton = null, expenseModalEl = null, expenseModalInstance = null, expenseForm = null, expenseListEl = null;
let weeklyTotalExpenseEl = null, monthlyTotalExpenseEl = null, yearlyTotalExpenseEl = null;
let expenseChartCanvas = null, expenseChart = null;
let addSavingModalButton = null, savingModalEl = null, savingModalInstance = null, savingForm = null, savingListEl = null;
let weeklyTotalSavingEl = null, monthlyTotalSavingEl = null, yearlyTotalSavingEl = null;
let savingChartCanvas = null, savingChart = null;
let storyListEl = null;
let allExpenses = [], allSavings = [], allStories = [], currentUser = null;

// --- 2. SECURITY CHECK ---
if (!token) {
    console.warn("Security Check: No token found, redirecting to login.");
    // Redirect immediately if no token, stopping further script execution in this context
    window.location.href = 'login.html';
    // Throw an error to potentially halt further non-async script execution if needed, though redirect is usually sufficient
    // throw new Error("Redirecting to login: No authentication token found.");
} else {
    console.log("Security Check: Token found, proceeding.");
}

// --- 3. QUOTES ---
const quotes = [ "சிறு துளி பெரு வெள்ளம்", "செலவு செய்ய தெரிஞ்சவன் சாதாரணன்; சேமிக்க தெரிஞ்சவன் சாமர்த்தியசாலி.", "வாழ்க்கை வெற்றி கடையில் கிடைக்காது, ஒவ்வொரு ரூபாயும் கற்றுக் கொடுக்கிறது.", "பணம் சேமிக்கிறவன் ஏழை இல்ல; எதிர்காலத்தை தயார் பண்ணிறவன்.", "செலவு பத்தி பயப்படாதே, ஆனால் செலவுல பயன் இருக்கணும்." ];
function displayQuote() {
    console.log("Attempting to display quote...");
    try {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = `"${quotes[randomIndex]}"`;
        // Check elements exist before setting text
        if (quoteHomeEl) quoteHomeEl.textContent = quote; else console.warn("displayQuote: quoteHomeEl not found");
        if (quoteTrackerEl) quoteTrackerEl.textContent = quote; else console.warn("displayQuote: quoteTrackerEl not found");
        if (quoteSavingsEl) quoteSavingsEl.textContent = "சேமிப்பு பழக்கம் வாழ்க்கையின் வளம்."; else console.warn("displayQuote: quoteSavingsEl not found");
        console.log("Quote display attempt finished.");
    } catch (e) { console.error("Error displaying quote:", e); }
}

// --- 4. DOMContentLoaded: GET ELEMENTS, INITIALIZE MATERIALIZE, START APP ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded. Getting elements...");

    // --- Assign Elements (Safely inside DOMContentLoaded) ---
    homeView = document.getElementById('home-view');
    expenseTrackerView = document.getElementById('expense-tracker-view');
    savingsTrackerView = document.getElementById('savings-tracker-view');
    storyListView = document.getElementById('story-list-view');
    views = [homeView, expenseTrackerView, savingsTrackerView, storyListView].filter(el => el !== null);
    if(views.length < 4) console.warn("One or more view sections may be missing!");

    homeLink = document.getElementById('home-link');
    trackerLink = document.getElementById('tracker-link');
    savingsLink = document.getElementById('savings-link');
    storiesLink = document.getElementById('stories-link');
    trackerLinkMobile = document.getElementById('tracker-link-mobile');
    savingsLinkMobile = document.getElementById('savings-link-mobile');
    storiesLinkMobile = document.getElementById('stories-link-mobile');
    navLinks = [trackerLink, savingsLink, storiesLink, trackerLinkMobile, savingsLinkMobile, storiesLinkMobile].filter(el => el !== null);

    logoutButton = document.getElementById('logout-button');
    logoutButtonMobile = document.getElementById('logout-button-mobile');
    welcomeMessage = document.getElementById('welcome-message');
    quoteHomeEl = document.getElementById('quote-home');
    quoteTrackerEl = document.getElementById('quote-tracker');
    quoteSavingsEl = document.getElementById('quote-savings');
    userDisplayNameEl = document.getElementById('user-display-name');

    addExpenseModalButton = document.getElementById('add-expense-modal-button');
    expenseModalEl = document.getElementById('expense-modal');
    expenseForm = document.getElementById('expense-form'); // Form INSIDE modal
    expenseListEl = document.getElementById('expense-list');
    weeklyTotalExpenseEl = document.getElementById('weekly-total-expense');
    monthlyTotalExpenseEl = document.getElementById('monthly-total-expense');
    yearlyTotalExpenseEl = document.getElementById('yearly-total-expense');
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) expenseChartCanvas = expenseCtx.getContext('2d'); else console.error("Expense chart canvas element (#expenseChart) not found!");

    addSavingModalButton = document.getElementById('add-saving-modal-button');
    savingModalEl = document.getElementById('saving-modal');
    savingForm = document.getElementById('saving-form'); // Form INSIDE modal
    savingListEl = document.getElementById('saving-list');
    weeklyTotalSavingEl = document.getElementById('weekly-total-saving');
    monthlyTotalSavingEl = document.getElementById('monthly-total-saving');
    yearlyTotalSavingEl = document.getElementById('yearly-total-saving');
    const savingCtx = document.getElementById('savingChart');
    if (savingCtx) savingChartCanvas = savingCtx.getContext('2d'); else console.error("Saving chart canvas element (#savingChart) not found!");

    storyListEl = document.getElementById('story-list');
    console.log("Finished assigning elements.");
    // --- End Assign Elements ---


    // --- Initialize Materialize Components ---
    let materializeReady = false;
    try {
        if (typeof M === 'undefined' || !M) {
             console.error("CRITICAL: Materialize JavaScript (M) is not defined! Check script tag order in HTML.");
             alert("Error: UI Library failed to load. Ensure materialize.min.js is loaded AFTER materialize.min.css and BEFORE main.js.");
             return; // Stop
        }
        console.log("Materialize object (M) IS defined. Initializing components...");

        // Init Modals
        const modalElems = document.querySelectorAll('.modal');
        if (modalElems.length > 0) {
            M.Modal.init(modalElems, {
                 onOpenEnd: function(modalElement) { // Callback when modal animation finishes
                     console.log("Modal opened:", modalElement.id);
                     // Ensure labels are floating correctly after modal opens
                     M.updateTextFields();
                 }
            });
            if (expenseModalEl) expenseModalInstance = M.Modal.getInstance(expenseModalEl);
            if (savingModalEl) savingModalInstance = M.Modal.getInstance(savingModalEl);
            console.log(`Modals Initialized (${modalElems.length}).`);
        } else { console.warn("No modal elements found."); }

        // Init Selects
        const selectElems = document.querySelectorAll('select');
        if (selectElems.length > 0) {
            M.FormSelect.init(selectElems, {});
            console.log(`Selects Initialized (${selectElems.length}).`);
        } else { console.warn("No select elements found."); }

        // Init Datepickers
        const datepickerElems = document.querySelectorAll('.datepicker');
        console.log(`Found ${datepickerElems.length} datepicker elements.`);
        if (datepickerElems.length > 0) {
            try {
                const datepickerInstances = M.Datepicker.init(datepickerElems, {
                    format: 'yyyy-mm-dd',
                    autoClose: true,
                    container: document.body // Often helps with z-index issues in modals
                });
                console.log("M.Datepicker.init CALLED.", datepickerInstances);
                datepickerElems.forEach(el => { // Verify instances right after
                    console.log(`Instance for #${el.id || 'NO ID'}:`, M.Datepicker.getInstance(el) ? 'Exists' : 'MISSING!');
                });
            } catch(dateError) { console.error("Error DURING M.Datepicker.init:", dateError); M.toast({html: 'Error initializing date pickers!', classes:'red'}); }
        } else { console.warn("No elements with class 'datepicker'. Check HTML class names."); }

        // Init Sidenav
        const sidenavElems = document.querySelectorAll('.sidenav');
        if (sidenavElems.length > 0) { M.Sidenav.init(sidenavElems); console.log(`Sidenav Initialized (${sidenavElems.length}).`); }
        else { console.warn("No sidenav elements."); }

        // Init FAB
        const fabElems = document.querySelectorAll('.fixed-action-btn');
        if (fabElems.length > 0) { M.FloatingActionButton.init(fabElems); console.log(`FAB Initialized (${fabElems.length}).`); }
        else { console.warn("No FAB elements."); }

        console.log("Materialize initialization phase finished.");
        materializeReady = true;

    } catch (error) { console.error("General Materialize Init Error:", error); alert("Error initializing page."); }

    // Attach Nav & Form Listeners
    attachNavListeners(); // Defined below
    attachFormListeners(); // Defined below

    // Start App Logic (only if token exists & UI ready)
    if (token && materializeReady) {
        initializeApp(); // Defined below
    } else {
        console.error(`App Initialization SKIPPED: Token=${!!token}, MaterializeReady=${materializeReady}`);
        if (!materializeReady && token) { alert("Could not load UI components."); }
        // If no token, redirect should have already happened
    }

}); // End DOMContentLoaded


// --- 5. NAVIGATION LOGIC (SPA) ---
function showView(viewToShow) {
    if (!viewToShow) { console.error("showView error: viewToShow is null/undefined"); return; }
    console.log("Switching view to:", viewToShow.id);
    views.forEach(view => { if(view) view.classList.add('hidden'); else console.warn("showView: A view element in the 'views' array is null"); });
    viewToShow.classList.remove('hidden');

    navLinks.forEach(link => { if(link && link.parentElement) link.parentElement.classList.remove('active'); });
    let activeLinkDesktop = null, activeLinkMobile = null;
    if (viewToShow === expenseTrackerView) { activeLinkDesktop = trackerLink; activeLinkMobile = trackerLinkMobile; }
    else if (viewToShow === savingsTrackerView) { activeLinkDesktop = savingsLink; activeLinkMobile = savingsLinkMobile; }
    else if (viewToShow === storyListView) { activeLinkDesktop = storiesLink; activeLinkMobile = storiesLinkMobile; }

    if(activeLinkDesktop && activeLinkDesktop.parentElement) activeLinkDesktop.parentElement.classList.add('active');
    if(activeLinkMobile && activeLinkMobile.parentElement) activeLinkMobile.parentElement.classList.add('active');

    if(viewToShow === homeView) { document.body.classList.add('royal-background'); }
    else { document.body.classList.remove('royal-background'); }
}

function attachNavListeners() {
    console.log("Attaching nav listeners...");
    if(homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); showView(homeView); }); else console.warn("homeLink missing");
    if(trackerLink) trackerLink.addEventListener('click', (e) => { e.preventDefault(); showView(expenseTrackerView); }); else console.warn("trackerLink missing");
    if(savingsLink) savingsLink.addEventListener('click', (e) => { e.preventDefault(); showView(savingsTrackerView); }); else console.warn("savingsLink missing");
    if(storiesLink) storiesLink.addEventListener('click', (e) => { e.preventDefault(); showView(storyListView); }); else console.warn("storiesLink missing");
    if(trackerLinkMobile) trackerLinkMobile.addEventListener('click', (e) => { e.preventDefault(); showView(expenseTrackerView); }); else console.warn("trackerLinkMobile missing");
    if(savingsLinkMobile) savingsLinkMobile.addEventListener('click', (e) => { e.preventDefault(); showView(savingsTrackerView); }); else console.warn("savingsLinkMobile missing");
    if(storiesLinkMobile) storiesLinkMobile.addEventListener('click', (e) => { e.preventDefault(); showView(storyListView); }); else console.warn("storiesLinkMobile missing");
    if (logoutButton) logoutButton.addEventListener('click', handleLogout); else console.warn("logoutButton missing");
    if (logoutButtonMobile) logoutButtonMobile.addEventListener('click', handleLogout); else console.warn("logoutButtonMobile missing");
    console.log("Nav listeners attached.");
}


// --- 6. LOGOUT ---
function handleLogout() {
    console.log("Logout action initiated.");
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
}

// --- 7. UPDATE WELCOME MESSAGE ---
function updateWelcomeMessage() {
    if (!welcomeMessage || !userDisplayNameEl) { console.warn("Welcome elements missing."); return; }
    const name = currentUser?.user_metadata?.full_name;
    if (name) {
        welcomeMessage.textContent = `Welcome, ${name}!`;
        userDisplayNameEl.textContent = `Hi, ${name.split(' ')[0]}!`;
    } else {
        welcomeMessage.textContent = 'Welcome!'; userDisplayNameEl.textContent = '';
    }
}

// --- 8. DELETE FUNCTIONS ---
async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        console.log(`Attempting to delete expense ID: ${id}`);
        const response = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers }); // ID in path for DELETE
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        M.toast({html: 'Expense deleted!', classes: 'green'});
        await fetchAndUpdateExpenses();
    } catch (error) { console.error('Delete expense error:', error); M.toast({html: `Error deleting expense: ${error.message}`, classes: 'red'}); }
}
async function deleteSaving(id) {
     if (!confirm('Delete this saving?')) return;
     try {
        console.log(`Attempting to delete saving ID: ${id}`);
        const response = await fetch(`${API_URL}/savings/${id}`, { method: 'DELETE', headers }); // ID in path for DELETE
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        M.toast({html: 'Saving deleted!', classes: 'green'});
        await fetchAndUpdateSavings();
     } catch (error) { console.error('Delete saving error:', error); M.toast({html: `Error deleting saving: ${error.message}`, classes: 'red'}); }
}

// --- 9. DISPLAY LIST (Generic) ---
function displayList(items, listElement, deleteFunction, type) {
    if (!listElement) { console.error(`List element for ${type} not found!`); return; }
    listElement.innerHTML = '';
    const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedItems.length === 0) {
        listElement.innerHTML = `<li class="collection-item grey-text center-align">No ${type}s recorded yet.</li>`; return;
    }

    sortedItems.slice(0, 15).forEach(item => {
        const li = document.createElement('li');
        li.className = 'collection-item avatar';
        const categoryText = item.category ? `(${item.category})` : '';
        const amountColor = type === 'expense' ? 'red-text' : 'green-text';
        const icon = type === 'expense' ? 'money_off' : 'attach_money';
        let formattedDate = 'Invalid Date';
        try { formattedDate = new Date(item.date).toLocaleDateString('en-GB'); } catch(e) { /* Ignore */ }
        const amountValue = Number(item.amount) || 0;

        li.innerHTML = `
            <i class="material-icons circle ${type === 'expense' ? 'red lighten-1' : 'green lighten-1'}"> ${icon} </i>
            <span class="title description">${item.description || 'N/A'} ${categoryText}</span>
            <p class="date grey-text">${formattedDate}</p>
            <span class="secondary-content ${amountColor} amount">
                ${type === 'expense' ? '-' : '+'}₹${amountValue.toFixed(2)}
                <a href="#!" class="delete-link"><i class="material-icons red-text text-darken-2">delete_forever</i></a>
            </span>
        `;
        const deleteLink = li.querySelector('.delete-link');
        if (deleteFunction && typeof deleteFunction === 'function') {
            deleteLink.onclick = (e) => { e.preventDefault(); deleteFunction(item.id); };
        } else { console.warn(`Invalid delete function provided for type ${type}`); }
        listElement.appendChild(li);
    });
}

// --- 10. CALCULATE STATS (Generic) ---
function calculateAndDisplayStats(items, type) {
    // ... (rest of function is the same, checks elements internally) ...
    const now = new Date();
    let startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - (now.getDay() || 7) + 1); startOfWeek.setHours(0,0,0,0);
    let weeklyTotal = 0, monthlyTotal = 0, yearlyTotal = 0;
    for (const item of items) { /* ... calculation logic ... */
      const amount = Number(item.amount) || 0; if (amount === 0) continue;
        try {
            const itemDate = new Date(item.date); if (isNaN(itemDate.getTime())) continue;
            itemDate.setHours(0,0,0,0);
            if (itemDate.getFullYear() === now.getFullYear()) {
                yearlyTotal += amount;
                if (itemDate.getMonth() === now.getMonth()) {
                    monthlyTotal += amount;
                    if (itemDate >= startOfWeek) { weeklyTotal += amount; }
                }
            }
        } catch(e) { console.error("Error processing date for stats:", item.date, e); }
    }
    const weeklyEl = type === 'expense' ? weeklyTotalExpenseEl : weeklyTotalSavingEl;
    const monthlyEl = type === 'expense' ? monthlyTotalExpenseEl : monthlyTotalSavingEl;
    const yearlyEl = type === 'expense' ? yearlyTotalExpenseEl : yearlyTotalSavingEl;
    if (weeklyEl) weeklyEl.textContent = `₹${weeklyTotal.toFixed(2)}`; else console.warn(`Weekly total element for ${type} missing`);
    if (monthlyEl) monthlyEl.textContent = `₹${monthlyTotal.toFixed(2)}`; else console.warn(`Monthly total element for ${type} missing`);
    if (yearlyEl) yearlyEl.textContent = `₹${yearlyTotal.toFixed(2)}`; else console.warn(`Yearly total element for ${type} missing`);
}

// --- 11. UPDATE CHART (Generic) ---
function updateChart(items, canvasContext, chartInstance, type) {
     if (!canvasContext) { console.warn(`Canvas context for ${type} chart missing!`); return; }
    // ... (rest of function is the same) ...
     const categoryTotals = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        const amount = Number(item.amount) || 0;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
    }, {});
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const backgroundColors = [ '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8BC34A', '#FF5722', '#00BCD4', '#673AB7', '#FFEB3B' ];
    const borderColors = backgroundColors.map(color => color.replace('rgba(','rgba(').replace(')',' ,1)'));

    const chartData = { labels, datasets: [{ label: `${type.charAt(0).toUpperCase() + type.slice(1)} by Category`, data, backgroundColor: backgroundColors.slice(0, labels.length), borderColor: borderColors.slice(0, labels.length), borderWidth: 1 }] };

    let currentChart = (type === 'expense') ? expenseChart : savingChart;

    if (currentChart) {
        currentChart.data = chartData;
        currentChart.update();
    } else {
        currentChart = new Chart(canvasContext, {
            type: 'doughnut', data: chartData,
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: labels.length > 0 && labels.length < 10, position: 'bottom' }, tooltip: { callbacks: { label: (context) => `${context.label || 'Uncategorized'}: ₹${context.parsed.toFixed(2)}` }}}}
        });
        if(type === 'expense') expenseChart = currentChart; else savingChart = currentChart;
        console.log(`${type} chart created.`);
    }
}

// --- 12. DISPLAY STORY LIST ---
function displayStoryList(stories) {
    if (!storyListEl) { console.error("Story list element not found!"); return; }
    // ... (rest of function is the same) ...
    storyListEl.innerHTML = '';
    if (!stories || stories.length === 0) { storyListEl.innerHTML = `<p class="center-align grey-text col s12">You haven't written any stories yet.</p>`; return;}
    stories.forEach(story => {
        const cardCol = document.createElement('div'); cardCol.className = 'col s12 m6 l4';
        const card = document.createElement('a'); card.href = `writer.html?id=${story.id}`; card.className = 'card story-card-link hoverable';
        const cardImageDiv = document.createElement('div'); cardImageDiv.className = 'card-image';
        const titleFirstWord = story.title?.split(' ')[0] || 'Story';
        const imgSrc = story.cover_image_url || `https://placehold.co/600x400/7e57c2/white?text=${encodeURIComponent(titleFirstWord)}`;
        cardImageDiv.innerHTML = `<img src="${imgSrc}" alt="${story.title || 'Story'} Cover" style="height: 150px; object-fit: cover;">`;
        const cardContentDiv = document.createElement('div'); cardContentDiv.className = 'card-content black-text';
        cardContentDiv.innerHTML = `<span class="card-title truncate">${story.title || 'Untitled'}</span><p class="story-excerpt">${story.content || 'No content...'}</p>`;
        card.appendChild(cardImageDiv); card.appendChild(cardContentDiv); cardCol.appendChild(card); storyListEl.appendChild(cardCol);
    });
}

// --- 13. DATA PROCESSING FUNCTIONS ---
function processExpenseData(expenses) {
    if(!Array.isArray(expenses)) expenses = [];
    displayList(expenses, expenseListEl, deleteExpense, 'expense');
    calculateAndDisplayStats(expenses, 'expense');
    if (expenseChartCanvas) updateChart(expenses, expenseChartCanvas, expenseChart, 'expense');
}
function processSavingsData(savings) {
    if(!Array.isArray(savings)) savings = [];
    displayList(savings, savingListEl, deleteSaving, 'saving');
    calculateAndDisplayStats(savings, 'saving');
    if (savingChartCanvas) updateChart(savings, savingChartCanvas, savingChart, 'saving');
}

// --- 14. FETCH AND UPDATE FUNCTIONS ---
async function fetchAndUpdateExpenses() {
    console.log("Fetching latest expenses...");
    try {
        const res = await fetch(`${API_URL}/expenses`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch expenses: ${res.statusText}`);
        allExpenses = await res.json() || [];
        processExpenseData(allExpenses);
        console.log("Expenses updated.");
    } catch (error) { console.error("Error fetching/updating expenses:", error); if (typeof M !== 'undefined') M.toast({html: "Could not update expenses.", classes: 'red'}); }
}
async function fetchAndUpdateSavings() {
     console.log("Fetching latest savings...");
     try {
        const res = await fetch(`${API_URL}/savings`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch savings: ${res.statusText}`);
        allSavings = await res.json() || [];
        processSavingsData(allSavings);
        console.log("Savings updated.");
    } catch (error) { console.error("Error fetching/updating savings:", error); if (typeof M !== 'undefined') M.toast({html: "Could not update savings.", classes: 'red'}); }
}

// --- 15. ADD ITEM HANDLERS (Attach Listeners Separately) ---
function attachFormListeners() {
    console.log("Attaching form listeners...");
    if(expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Expense form submitted.");
            const description = document.getElementById('expense-description').value;
            const amount = document.getElementById('expense-amount').value;
            const dateInput = document.getElementById('expense-date');
            const categorySelect = document.getElementById('expense-category');
            const category = categorySelect.value;
            const datepickerInstance = M.Datepicker.getInstance(dateInput);
            const date = datepickerInstance ? datepickerInstance.toString('yyyy-mm-dd') : dateInput.value;

            if (!category) { M.toast({html: 'Please select category.', classes: 'orange'}); return; }
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { M.toast({html: 'Please select a valid date (YYYY-MM-DD).', classes: 'orange'}); return; }
            if (!amount || parseFloat(amount) <= 0) { M.toast({html: 'Please enter valid amount.', classes: 'orange'}); return; }

            try {
                const response = await fetch(`${API_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ description, amount: parseFloat(amount), date, category }) });
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                expenseForm.reset();
                categorySelect.value = "";
                if (typeof M !== 'undefined' && M.FormSelect) M.FormSelect.init(categorySelect, {});
                if (expenseModalInstance) expenseModalInstance.close(); else console.warn("Cannot close expense modal - instance not found");
                M.toast({html: 'Expense added!', classes: 'green'});
                await fetchAndUpdateExpenses();
            } catch (error) { console.error('Failed to add expense:', error); M.toast({html: `Failed to add expense: ${error.message}`, classes: 'red'}); }
        });
    } else { console.error("Expense form element not found!"); }

    if(savingForm) {
        savingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Saving form submitted.");
            const description = document.getElementById('saving-description').value;
            const amount = document.getElementById('saving-amount').value;
            const dateInput = document.getElementById('saving-date');
            const categorySelect = document.getElementById('saving-category');
            const category = categorySelect.value;
            const datepickerInstance = M.Datepicker.getInstance(dateInput);
            const date = datepickerInstance ? datepickerInstance.toString('yyyy-mm-dd') : dateInput.value;

             if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { M.toast({html: 'Please select a valid date (YYYY-MM-DD).', classes: 'orange'}); return; }
             if (!amount || parseFloat(amount) <= 0) { M.toast({html: 'Please enter valid amount.', classes: 'orange'}); return; }

             try {
                const response = await fetch(`${API_URL}/savings`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ description, amount: parseFloat(amount), date, category: category || null }) });
                 if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                savingForm.reset();
                categorySelect.value = "";
                if (typeof M !== 'undefined' && M.FormSelect) M.FormSelect.init(categorySelect, {});
                if (savingModalInstance) savingModalInstance.close(); else console.warn("Cannot close saving modal - instance not found");
                M.toast({html: 'Saving added!', classes: 'green'});
                await fetchAndUpdateSavings();
            } catch (error) { console.error('Failed to add saving:', error); M.toast({html: `Failed to add saving: ${error.message}`, classes: 'red'}); }
        });
    } else { console.error("Saving form element not found!"); }
    console.log("Form listeners attached.");
}


// --- 16. INITIAL APP LOAD ---
async function initializeApp() {
    console.log("initializeApp called.");
    if (!token) { console.error("initializeApp aborted: No token."); return; }

    displayQuote(); // Show quote now that elements are assigned

    try {
        console.log("Fetching initial data...");
        const currentHeaders = { 'Authorization': `Bearer ${token}` };

        const [userRes, expensesRes, savingsRes, storiesRes] = await Promise.all([
            fetch(`${API_URL}/me`, { headers: currentHeaders }),
            fetch(`${API_URL}/expenses`, { headers: currentHeaders }),
            fetch(`${API_URL}/savings`, { headers: currentHeaders }),
            fetch(`${API_URL}/stories`, { headers: currentHeaders })
        ]);
        console.log("Initial data fetch completed. User Status:", userRes.status);

        if (!userRes.ok) throw new Error('Authentication failed');
        currentUser = await userRes.json();
        console.log("User data received:", currentUser);

        if (!expensesRes.ok) console.error('Failed to fetch expenses:', await expensesRes.text());
        if (!savingsRes.ok) console.error('Failed to fetch savings:', await savingsRes.text());
        if (!storiesRes.ok) console.error('Failed to fetch stories:', await storiesRes.text());

        allExpenses = expensesRes.ok ? await expensesRes.json() : [];
        allSavings = savingsRes.ok ? await savingsRes.json() : [];
        allStories = storiesRes.ok ? await storiesRes.json() : [];
        console.log(`Fetched ${allExpenses.length} expenses, ${allSavings.length} savings, ${allStories.length} stories.`);

        // Ensure updateWelcomeMessage is defined before calling
        if(typeof updateWelcomeMessage === 'function') updateWelcomeMessage(); else console.error("updateWelcomeMessage function not defined");
        if(typeof processExpenseData === 'function') processExpenseData(allExpenses); else console.error("processExpenseData function not defined");
        if(typeof processSavingsData === 'function') processSavingsData(allSavings); else console.error("processSavingsData function not defined");
        if(typeof displayStoryList === 'function') displayStoryList(allStories); else console.error("displayStoryList function not defined");

        if(typeof showView === 'function') showView(homeView); else console.error("showView function not defined");
        console.log("Dashboard initialized successfully.");

    } catch (error) {
        console.error("Initialization Error:", error);
        if (error.message === 'Authentication failed' || error.message.includes('token')) {
            console.log("Redirecting to login due to auth error.");
            localStorage.removeItem('access_token'); window.location.href = 'login.html';
        } else {
             if(typeof M !== 'undefined' && M.toast) { M.toast({html: `Error loading data: ${error.message}`, classes: 'red duration-long'}); }
             else { alert(`Error loading data: ${error.message}. Please try again later.`); }
        }
    }
}

// --- 17. RUN ---
// NOTE: initializeApp is now called by the DOMContentLoaded listener.
console.log("main.js script execution finished. Waiting for DOMContentLoaded.");