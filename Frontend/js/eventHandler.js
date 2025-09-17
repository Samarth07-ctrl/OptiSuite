import apiService from './apiService.js';
import { PageLogic } from './pageLogic.js';
import { UI } from './ui.js';

export const EventHandler = {
    init() {
        this.setupAuthHandlers();
        this.setupNavigationHandlers();
        this.setupGlobalHandlers();
    },

    setupAuthHandlers() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(e);
        });

        // Show register form
        document.getElementById('showRegister').addEventListener('click', () => {
            document.getElementById('loginContainer').classList.add('hidden');
            document.getElementById('registerContainer').classList.remove('hidden');
        });

        // Show login form
        document.getElementById('showLogin').addEventListener('click', () => {
            document.getElementById('registerContainer').classList.add('hidden');
            document.getElementById('loginContainer').classList.remove('hidden');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    },

    setupNavigationHandlers() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });
    },

    setupGlobalHandlers() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close modals on Escape
                const modal = document.querySelector('.modal-backdrop');
                if (modal) {
                    modal.remove();
                }
            }
        });

        // Handle clicks outside modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.remove();
            }
        });
    },

    async handleLogin(event) {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await apiService.login(email, password);
            
            // Store user data
            apiService.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user || { name: response.name, role: response.role }));
            
            // Show main app
            this.showMainApp();
            
            UI.showToast('Login successful!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            UI.showToast('Login failed: ' + error.message, 'error');
        }
    },

    async handleRegister(event) {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        try {
            await apiService.register(name, email, password, role);
            UI.showToast('Registration successful! Please login.', 'success');
            
            // Switch to login form
            document.getElementById('registerContainer').classList.add('hidden');
            document.getElementById('loginContainer').classList.remove('hidden');
        } catch (error) {
            console.error('Register error:', error);
            UI.showToast('Registration failed: ' + error.message, 'error');
        }
    },

    handleLogout() {
        apiService.clearToken();
        localStorage.removeItem('user');
        
        // Hide main app and show login
        document.getElementById('appContainer').classList.add('hidden');
        document.getElementById('loginContainer').classList.remove('hidden');
        
        UI.showToast('Logged out successfully', 'info');
    },

    showMainApp() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Hide auth forms and show main app
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        // Update user info in header
        document.getElementById('userInfo').textContent = `${user.name} (${user.role})`;
        
        // Hide admin-only links for employees
        if (user.role !== 'admin') {
            document.getElementById('customersLink').style.display = 'none';
            document.getElementById('reportsLink').style.display = 'none';
        }
        
        // Show dashboard by default
        this.navigateToPage('dashboard');
    },

    navigateToPage(page) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Load page content
        switch (page) {
            case 'dashboard':
                PageLogic.showDashboard();
                break;
            case 'inventory':
                PageLogic.showInventory();
                break;
            case 'customers':
                PageLogic.showCustomers();
                break;
            case 'sales':
                PageLogic.showSales();
                break;
            case 'reports':
                PageLogic.showReports();
                break;
            default:
                PageLogic.showDashboard();
        }
    }
};
