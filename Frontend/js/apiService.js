class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.requireAuth !== false),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(email, password) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            requireAuth: false,
        });
    }

    async register(name, email, password, role) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
            requireAuth: false,
        });
    }

    // Products endpoints
    async getProducts() {
        return this.makeRequest('/products');
    }

    async createProduct(productData) {
        return this.makeRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(id, productData) {
        return this.makeRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(id) {
        return this.makeRequest(`/products/${id}`, {
            method: 'DELETE',
        });
    }

    // Customers endpoints
    async getCustomers() {
        return this.makeRequest('/customers');
    }

    async createCustomer(customerData) {
        return this.makeRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData),
        });
    }

    async updateCustomer(id, customerData) {
        return this.makeRequest(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customerData),
        });
    }

    async deleteCustomer(id) {
        return this.makeRequest(`/customers/${id}`, {
            method: 'DELETE',
        });
    }

    // Sales endpoints
    async getSales() {
        return this.makeRequest('/sales');
    }

    async createSale(saleData) {
        return this.makeRequest('/sales', {
            method: 'POST',
            body: JSON.stringify(saleData),
        });
    }

    async updateSale(id, saleData) {
        return this.makeRequest(`/sales/${id}`, {
            method: 'PUT',
            body: JSON.stringify(saleData),
        });
    }

    async deleteSale(id) {
        return this.makeRequest(`/sales/${id}`, {
            method: 'DELETE',
        });
    }
}

export default new ApiService();
