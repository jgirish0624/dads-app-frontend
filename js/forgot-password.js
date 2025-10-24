// --- 1. CONNECT TO SUPABASE (with PUBLIC key) ---
// !!! MAKE SURE THESE ARE YOUR KEYS !!!
const SUPABASE_URL = 'https://[your-project-url].supabase.co'; 
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY_HERE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. GET HTML ELEMENTS ---
const forgotPasswordForm = document.getElementById('forgot-password-form');
const emailInput = document.getElementById('forgot-email');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// --- 3. FORM SUBMIT EVENT ---
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;

    // Clear previous messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // This is the Supabase function to send a reset email
    const { data, error } = await supabaseClient.auth
        .resetPasswordForEmail(email, {
            redirectTo: 'https://[your-live-app-url]/reset.html' // IMPORTANT: See note below
        });

    if (error) {
        errorMessage.textContent = error.message;
    } else {
        successMessage.textContent = 'Password reset email sent! Please check your inbox.';
    }
});