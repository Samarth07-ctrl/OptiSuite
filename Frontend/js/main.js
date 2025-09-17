import { EventHandler } from './eventHandler.js';
import apiService from './apiService.js';

class App {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            // User is logged in, show main app
            EventHandler.showMainApp();
        } else {
            // Show login form
            document.getElementById('loginContainer').classList.remove('hidden');
        }

        // Initialize event handlers
        EventHandler.init();

        // Initialize Lucide icons
        lucide.createIcons();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
