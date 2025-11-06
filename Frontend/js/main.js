import apiService from './apiService.js';
import { PageLogic } from './pageLogic.js';
import { UI } from './ui.js';

class App {
    constructor() {
        // Ensure DOM is ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log("App initializing..."); // Debug log
        try {
            if (localStorage.getItem('token') && localStorage.getItem('user')) {
                this.showMainApp();
            } else {
                this.showAuthPage();
            }
            this.setupEventListeners();
            this.initDarkMode();
            // Initial icon render needs to happen *after* potential layout shifts
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                     lucide.createIcons();
                     console.log("Lucide icons rendered on init."); // Debug log
                } else {
                     console.error("Lucide is not defined on init.");
                }
            }, 50);
        } catch (error) {
             console.error("Initialization failed:", error); // Log any init errors
             // Display a user-friendly error message on the page
             document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Application failed to initialize. Please check the console (F12) for errors.</div>';
        }
    }

    setupEventListeners() {
        console.log("Setting up event listeners..."); // Debug log
        // Auth form switching
        const showRegisterBtn = document.getElementById('showRegister');
        const showLoginBtn = document.getElementById('showLogin');
        const loginContainer = document.getElementById('loginContainer');
        const registerContainer = document.getElementById('registerContainer');

        showRegisterBtn?.addEventListener('click', () => {
            loginContainer?.classList.add('hidden');
            registerContainer?.classList.remove('hidden');
        });
        showLoginBtn?.addEventListener('click', () => {
            registerContainer?.classList.add('hidden');
            loginContainer?.classList.remove('hidden');
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // App navigation
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Ensure PageLogic exists before calling
                if (typeof PageLogic !== 'undefined' && PageLogic.navigateToPage) {
                    PageLogic.navigateToPage(link.dataset.page);
                } else {
                    console.error("PageLogic or navigateToPage is not available.");
                }
            });
        });

        // Dark Mode Toggle
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());

        // Floating Action Button (FAB)
        document.getElementById('fab')?.addEventListener('click', () => {
             // Ensure PageLogic exists
            if (typeof PageLogic === 'undefined') {
                console.error("PageLogic not available for FAB click.");
                return;
            }
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') {
                const currentPage = document.querySelector('.nav-link.active')?.dataset.page;
                if (currentPage === 'inventory' && PageLogic.addProduct) PageLogic.addProduct();
                else if (currentPage === 'customers' && PageLogic.addCustomer) PageLogic.addCustomer();
                else if (PageLogic.navigateToPage) PageLogic.navigateToPage('employee-pos'); // Default FAB action
            } else {
                if (PageLogic.navigateToPage) PageLogic.navigateToPage('employee-pos');
            }
        });
         console.log("Event listeners set up."); // Debug log
    }

    async handleLogin(event) {
        event.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const submitButton = event.target.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput || !submitButton) {
            console.error("Login form elements not found.");
            UI.showToast("An unexpected error occurred.", "error");
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        submitButton.textContent = 'Signing In...'; submitButton.disabled = true;
        try {
            const response = await apiService.login(email, password);
            if (!response.token || !response.name || !response.role) {
                 throw new Error("Invalid login response from server."); // Validate response
            }
            apiService.setToken(response.token);
            const userToStore = { name: response.name, role: response.role };
            localStorage.setItem('user', JSON.stringify(userToStore));
            this.showMainApp();
            UI.showToast('Login successful!', 'success');
        } catch (error) {
            console.error("Login failed:", error); // Log error details
            UI.showToast(`Login failed: ${error.message || 'Server error'}`, 'error');
            submitButton.textContent = 'Sign In'; submitButton.disabled = false;
        }
    }

    async handleRegister(event) {
         event.preventDefault();
         const nameInput = document.getElementById('registerName');
         const emailInput = document.getElementById('registerEmail');
         const passwordInput = document.getElementById('registerPassword');
         const roleInput = document.getElementById('registerRole');
         const submitButton = event.target.querySelector('button[type="submit"]');

         if (!nameInput || !emailInput || !passwordInput || !roleInput || !submitButton) {
             console.error("Register form elements not found.");
             UI.showToast("An unexpected error occurred.", "error");
             return;
         }

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const role = roleInput.value;

        submitButton.textContent = 'Creating...'; submitButton.disabled = true;
        try {
            await apiService.register({ name, email, password, role });
            UI.showToast('Registration successful! Please login.', 'success');
            document.getElementById('registerContainer')?.classList.add('hidden');
            document.getElementById('loginContainer')?.classList.remove('hidden');
        } catch (error) {
            console.error("Registration failed:", error); // Log error details
            UI.showToast(`Registration failed: ${error.message || 'Server error'}`, 'error');
            submitButton.textContent = 'Create Account'; submitButton.disabled = false;
        }
    } // <-- This is likely around line 168, ensure it's closed correctly.

    handleLogout() {
        apiService.clearToken();
        this.showAuthPage();
        UI.showToast('Logged out successfully', 'info');
    }

    showAuthPage() {
        document.getElementById('authContainer')?.style.setProperty('display', 'flex');
        document.getElementById('appContainer')?.style.setProperty('display', 'none');
        document.getElementById('loginContainer')?.classList.remove('hidden');
        document.getElementById('registerContainer')?.classList.add('hidden');
         // Ensure icons render if needed on auth page (unlikely but safe)
         setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);
    }

    showMainApp() {
        document.getElementById('authContainer')?.style.setProperty('display', 'none');
        document.getElementById('appContainer')?.style.setProperty('display', 'block');

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <p class="font-bold text-[hsl(var(--c-text))]">${user.name || 'User'}</p>
                <p class="text-xs text-[hsl(var(--c-text-subtle))] capitalize">${user.role || 'Role'}</p>
            `;
        }

        const isAdmin = user.role === 'admin';
        document.getElementById('customersLink')?.style.setProperty('display', isAdmin ? 'flex' : 'none');
        document.getElementById('salesLink')?.style.setProperty('display', isAdmin ? 'flex' : 'none');
        document.getElementById('reportsLink')?.style.setProperty('display', isAdmin ? 'flex' : 'none');

         // Ensure PageLogic exists before navigating
         if (typeof PageLogic !== 'undefined' && PageLogic.navigateToPage) {
            if (isAdmin) PageLogic.navigateToPage('dashboard');
            else PageLogic.navigateToPage('employee-pos');
         } else {
             console.error("PageLogic not available during showMainApp navigation.");
             document.getElementById('mainContent').innerHTML = '<p style="color: red;">Error: Page navigation logic failed to load.</p>';
         }

        // Render icons after potential layout changes and navigation
        setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);
    }

    initDarkMode() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 0); // Render icons after theme set
    }

    toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
        // Re-render icons after theme change
        setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 0);
    }
} // <-- Ensure this closing brace for the App class is present

// Initialize the application ONLY after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
     try {
         new App();
     } catch(e) {
          console.error("Error during App instantiation:", e);
          document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">A critical error occurred. Please check the console (F12).</div>';
     }
}); // <-- Ensure this closing parenthesis and semicolon are present