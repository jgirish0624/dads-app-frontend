// --- 1. CONNECT TO SUPABASE (with PUBLIC key) ---
const SUPABASE_URL = 'https://ndosyfmdfjjnmwtumixg.supabase.co'; // !!! PASTE YOUR URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3N5Zm1kZmpqbm13dHVtaXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTk2MTQsImV4cCI6MjA3Njc5NTYxNH0.J5BMbKrh1BP2SvHhx3pm8oyWwy-z40-ydlu9l1D4NeQ'; // !!! PASTE YOUR ANON KEY

// Use the global 'supabase' object (from the CDN script)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. GET HTML ELEMENTS ---
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// --- 3. LOGIN EVENT ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorMessage.textContent = error.message;
    } else {
        // SUCCESS! Save the token and go to the app.
        localStorage.setItem('access_token', data.session.access_token);
        window.location.href = 'index.html';
    }
});