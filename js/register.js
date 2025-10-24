// --- 1. CONNECT TO SUPABASE (with PUBLIC key) ---
// !!! MAKE SURE THESE ARE YOUR KEYS !!!
const SUPABASE_URL = 'https://ndosyfmdfjjnmwtumixg.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3N5Zm1kZmpqbm13dHVtaXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTk2MTQsImV4cCI6MjA3Njc5NTYxNH0.J5BMbKrh1BP2SvHhx3pm8oyWwy-z40-ydlu9l1D4NeQ'; // !!! PASTE YOUR ANON KEY


const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. GET HTML ELEMENTS ---
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const registerButton = document.querySelector('#register-form button'); // Get the button

// --- 3. SIGNUP EVENT ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = ''; // Clear errors
    registerButton.disabled = true; // Disable button
    registerButton.textContent = 'Registering...';

    // Get all form values
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name 
            }
        }
    });

    if (error) {
        // --- THIS IS THE FIX ---
        if (error.message.includes("User already registered")) {
            errorMessage.textContent = 'This email is already in use. Please go to the Login page.';
        } else {
            errorMessage.textContent = error.message;
        }
        registerButton.disabled = false; // Re-enable button
        registerButton.textContent = 'Register';
    } else {
        // SUCCESS!
        localStorage.setItem('access_token', data.session.access_token);
        alert('Signup successful! Redirecting to the dashboard...');
        window.location.href = 'index.html';
    }
});