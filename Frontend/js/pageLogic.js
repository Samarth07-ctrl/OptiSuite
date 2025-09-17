import apiService from './apiService.js';
import { UI } from './ui.js';

export const PageLogic = {
    // Add navigation function to make it globally accessible
    navigateToPage(page) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const targetLink = document.querySelector(`[data-page="${page}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Load page content based on the page parameter
        switch (page) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'inventory':
                this.showInventory();
                break;
            case 'customers':
                this.showCustomers();
                break;
            case 'sales':
                this.showSales();
                break;
            case 'reports':
                this.showReports();
                break;
            default:
                this.showDashboard();
        }
    },

    async showDashboard() {
        document.getElementById('pageTitle').textContent = 'Dashboard';
        document.getElementById('mainContent').innerHTML = UI.showLoading();

        try {
            // Get dashboard data
            const [products, sales, customers] = await Promise.all([
                apiService.getProducts().catch(() => []),
                apiService.getSales().catch(() => []),
                apiService.getCustomers().catch(() => [])
            ]);

            const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
            const lowStockItems = products.filter(p => (parseInt(p.quantity) || 0) < 10);

            const dashboardContent = `
                <!-- Welcome Section -->
                <div class="mb-8">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold mb-2">Welcome back!</h1>
                                <p class="text-blue-100 text-lg">Here's what's happening with your business today.</p>
                            </div>
                            <div class="hidden md:block">
                                <i data-lucide="trending-up" class="h-16 w-16 text-blue-200"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <i data-lucide="package" class="h-6 w-6 text-blue-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500">Total Products</span>
                        </div>
                        <div class="text-2xl font-bold text-gray-900 mb-1">${products.length}</div>
                        <div class="text-sm text-green-600 font-medium">+12% from last month</div>
                    </div>

                    <div class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <i data-lucide="shopping-cart" class="h-6 w-6 text-green-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500">Total Sales</span>
                        </div>
                        <div class="text-2xl font-bold text-gray-900 mb-1">${sales.length}</div>
                        <div class="text-sm text-green-600 font-medium">+8% from last week</div>
                    </div>

                    <div class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                                <i data-lucide="dollar-sign" class="h-6 w-6 text-yellow-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500">Revenue</span>
                        </div>
                        <div class="text-2xl font-bold text-gray-900 mb-1">$${totalRevenue.toFixed(2)}</div>
                        <div class="text-sm text-green-600 font-medium">+15% from last month</div>
                    </div>

                    <div class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <i data-lucide="alert-triangle" class="h-6 w-6 text-red-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-500">Low Stock</span>
                        </div>
                        <div class="text-2xl font-bold text-gray-900 mb-1">${lowStockItems.length}</div>
                        <div class="text-sm text-red-600 font-medium">Needs attention</div>
                    </div>
                </div>

                <!-- Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Recent Sales -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-100">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Recent Sales</h3>
                                    <button onclick="PageLogic.navigateToPage('sales')" class="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">View all</button>
                                </div>
                            </div>
                            <div class="p-6">
                                ${sales.length > 0 ? `
                                    <div class="space-y-4">
                                        ${sales.slice(0, 5).map(sale => `
                                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <i data-lucide="shopping-bag" class="h-5 w-5 text-blue-600"></i>
                                                    </div>
                                                    <div>
                                                        <p class="font-medium text-gray-900">Sale #${sale.id}</p>
                                                        <p class="text-sm text-gray-500">${new Date(sale.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <p class="font-semibold text-gray-900">$${parseFloat(sale.total_amount || 0).toFixed(2)}</p>
                                                    <p class="text-sm text-green-600">Completed</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="text-center py-8">
                                        <i data-lucide="shopping-cart" class="h-12 w-12 text-gray-300 mx-auto mb-4"></i>
                                        <p class="text-gray-500">No sales recorded yet</p>
                                        <button onclick="PageLogic.addSale()" class="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">Record your first sale</button>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions & Alerts -->
                    <div class="space-y-6">
                        <!-- Quick Actions -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button onclick="PageLogic.addProduct()" class="w-full flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                    <i data-lucide="plus" class="h-4 w-4 mr-2"></i>
                                    Add Product
                                </button>
                                <button onclick="PageLogic.addSale()" class="w-full flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                    <i data-lucide="shopping-cart" class="h-4 w-4 mr-2"></i>
                                    New Sale
                                </button>
                                <button onclick="PageLogic.navigateToPage('inventory')" class="w-full flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
                                    <i data-lucide="package" class="h-4 w-4 mr-2"></i>
                                    View Inventory
                                </button>
                            </div>
                        </div>

                        <!-- Low Stock Alerts -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                            ${lowStockItems.length > 0 ? `
                                <div class="space-y-3">
                                    ${lowStockItems.slice(0, 5).map(product => `
                                        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                            <div>
                                                <p class="font-medium text-gray-900">${product.name}</p>
                                                <p class="text-sm text-red-600">Only ${product.quantity} left</p>
                                            </div>
                                            <span class="text-red-600 font-semibold">${product.quantity}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="text-center py-4">
                                    <i data-lucide="check-circle" class="h-8 w-8 text-green-500 mx-auto mb-2"></i>
                                    <p class="text-green-600 font-medium">All items well stocked!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = dashboardContent;
            lucide.createIcons();
        } catch (error) {
            console.error('Dashboard error:', error);
            document.getElementById('mainContent').innerHTML = `
                <div class="text-center py-12">
                    <i data-lucide="alert-circle" class="h-16 w-16 text-red-400 mx-auto mb-4"></i>
                    <p class="text-red-600 text-lg font-medium">Error loading dashboard</p>
                    <p class="text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            `;
        }
    },

    async showInventory() {
        document.getElementById('pageTitle').textContent = 'Inventory Management';
        document.getElementById('mainContent').innerHTML = UI.showLoading();

        try {
            const products = await apiService.getProducts();
            
            const inventoryContent = `
                <!-- Header Section -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Product Inventory</h2>
                        <p class="text-gray-600">Manage your products and track stock levels</p>
                    </div>
                    <button onclick="PageLogic.addProduct()" class="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                        <i data-lucide="plus" class="h-5 w-5 mr-2"></i>
                        Add Product
                    </button>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1">
                            <div class="relative">
                                <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"></i>
                                <input type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>All Categories</option>
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Books</option>
                        </select>
                    </div>
                </div>

                ${products.length > 0 ? `
                    <!-- Products Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${products.map(product => `
                            <div class="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                                <!-- Product Image Placeholder -->
                                <div class="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                    <i data-lucide="package" class="h-16 w-16 text-blue-300"></i>
                                </div>
                                
                                <div class="p-6">
                                    <div class="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">${product.name}</h3>
                                            <p class="text-sm text-gray-500">SKU: ${product.sku || 'N/A'}</p>
                                        </div>
                                        <div class="flex space-x-1">
                                            <button onclick="PageLogic.editProduct('${product.id}')" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <i data-lucide="edit" class="h-4 w-4"></i>
                                            </button>
                                            <button onclick="PageLogic.deleteProduct('${product.id}')" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="text-2xl font-bold text-gray-900">$${parseFloat(product.price || 0).toFixed(2)}</div>
                                        <div class="flex items-center ${parseInt(product.quantity) < 10 ? 'text-red-600' : parseInt(product.quantity) < 50 ? 'text-yellow-600' : 'text-green-600'}">
                                            <i data-lucide="package" class="h-4 w-4 mr-1"></i>
                                            <span class="font-medium">${product.quantity || 0}</span>
                                        </div>
                                    </div>
                                    
                                    ${product.category ? `
                                        <div class="mb-4">
                                            <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">${product.category}</span>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="flex space-x-2">
                                        <button onclick="PageLogic.editProduct('${product.id}')" class="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                                            Edit
                                        </button>
                                        <button class="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                                            Details
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Stock Level Indicator -->
                                <div class="h-1 ${parseInt(product.quantity) < 10 ? 'bg-red-500' : parseInt(product.quantity) < 50 ? 'bg-yellow-500' : 'bg-green-500'}"></div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <!-- Empty State -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="package" class="h-12 w-12 text-blue-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                        <p class="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first product to the inventory.</p>
                        <button onclick="PageLogic.addProduct()" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                            <i data-lucide="plus" class="h-5 w-5 mr-2"></i>
                            Add Your First Product
                        </button>
                    </div>
                `}
            `;

            document.getElementById('mainContent').innerHTML = inventoryContent;
            lucide.createIcons();
        } catch (error) {
            console.error('Inventory error:', error);
            UI.showToast('Error loading inventory', 'error');
        }
    },

    // ... (continuing with the rest of your existing functions: addProduct, handleAddProduct, editProduct, deleteProduct)

    async showCustomers() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('pageTitle').textContent = 'Customer Management';
        
        if (user.role !== 'admin') {
            document.getElementById('mainContent').innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="lock" class="h-12 w-12 text-red-400"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
                    <p class="text-gray-500">Admin privileges required to view customer data.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        document.getElementById('mainContent').innerHTML = UI.showLoading();

        try {
            const customers = await apiService.getCustomers();

            const customersContent = `
                <!-- Header Section -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Customer Management</h2>
                        <p class="text-gray-600">Manage your customer relationships and contact information</p>
                    </div>
                    <button onclick="PageLogic.addCustomer()" class="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                        <i data-lucide="user-plus" class="h-5 w-5 mr-2"></i>
                        Add Customer
                    </button>
                </div>

                ${customers.length > 0 ? `
                    <!-- Customers List -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 class="text-lg font-semibold text-gray-900">Customer Directory</h3>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                ${customers.map((customer, index) => {
                                    const initials = customer.name ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA';
                                    const colors = ['blue', 'green', 'purple', 'yellow', 'red'];
                                    const color = colors[index % colors.length];
                                    
                                    return `
                                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div class="flex items-center space-x-4">
                                                <div class="w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center">
                                                    <span class="text-${color}-700 font-semibold">${initials}</span>
                                                </div>
                                                <div>
                                                    <h4 class="font-semibold text-gray-900">${customer.name || 'N/A'}</h4>
                                                    <p class="text-sm text-gray-500">${customer.email || 'N/A'}</p>
                                                    <p class="text-sm text-gray-500">${customer.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div class="flex space-x-2">
                                                <button onclick="PageLogic.editCustomer('${customer.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <i data-lucide="edit" class="h-4 w-4"></i>
                                                </button>
                                                <button onclick="PageLogic.deleteCustomer('${customer.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- Empty State -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="users" class="h-12 w-12 text-blue-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">No customers yet</h3>
                        <p class="text-gray-500 mb-6">Get started by adding your first customer.</p>
                        <button onclick="PageLogic.addCustomer()" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                            <i data-lucide="user-plus" class="h-5 w-5 mr-2"></i>
                            Add Your First Customer
                        </button>
                    </div>
                `}
            `;

            document.getElementById('mainContent').innerHTML = customersContent;
            lucide.createIcons();
        } catch (error) {
            console.error('Customers error:', error);
            UI.showToast('Error loading customers', 'error');
        }
    },

    // Keep your existing functions: addCustomer, handleAddCustomer, showSales, addSale, handleAddSale

    showReports() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('pageTitle').textContent = 'Reports & Analytics';
        
        if (user.role !== 'admin') {
            document.getElementById('mainContent').innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="lock" class="h-12 w-12 text-red-400"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
                    <p class="text-gray-500">Admin privileges required to view reports.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const reportsContent = `
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
                    <p class="text-gray-600">Get insights into your business performance and trends</p>
                </div>
            </div>

            <!-- Report Categories -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer">
                    <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                        <i data-lucide="trending-up" class="h-6 w-6 text-green-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Sales Reports</h3>
                    <p class="text-gray-600 text-sm mb-4">Track revenue, sales trends, and performance metrics</p>
                    <div class="flex items-center text-green-600 text-sm font-medium">
                        <span>View Reports</span>
                        <i data-lucide="arrow-right" class="h-4 w-4 ml-2"></i>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer">
                    <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <i data-lucide="package" class="h-6 w-6 text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Inventory Reports</h3>
                    <p class="text-gray-600 text-sm mb-4">Monitor stock levels, turnover, and product performance</p>
                    <div class="flex items-center text-blue-600 text-sm font-medium">
                        <span>View Reports</span>
                        <i data-lucide="arrow-right" class="h-4 w-4 ml-2"></i>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer">
                    <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                        <i data-lucide="users" class="h-6 w-6 text-purple-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Customer Reports</h3>
                    <p class="text-gray-600 text-sm mb-4">Analyze customer behavior, retention, and lifetime value</p>
                    <div class="flex items-center text-purple-600 text-sm font-medium">
                        <span>View Reports</span>
                        <i data-lucide="arrow-right" class="h-4 w-4 ml-2"></i>
                    </div>
                </div>
            </div>

            <!-- Coming Soon Banner -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="bar-chart" class="h-12 w-12 text-blue-400"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                <p class="text-gray-500 mb-6">Detailed reports, charts, and business intelligence features will be available in the next update.</p>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = reportsContent;
        lucide.createIcons();
    },

    // Keep all your existing functions: addProduct, handleAddProduct, editProduct, deleteProduct, 
    // addCustomer, handleAddCustomer, showSales, addSale, handleAddSale, etc.
    
   addProduct() {
    const fields = [
        { name: 'name', label: 'Product Name', type: 'text', required: true },
        { name: 'brand', label: 'Brand', type: 'text', required: true },
        { 
            name: 'type', 
            label: 'Type', 
            type: 'select', 
            required: true,
            options: [
                { value: 'Frames', label: 'Frames' },
                { value: 'Lenses', label: 'Lenses' },
                { value: 'Contact Lenses', label: 'Contact Lenses' },
                { value: 'Sunglasses', label: 'Sunglasses' },
                { value: 'Accessories', label: 'Accessories' }
            ]
        },
        { name: 'price', label: 'Price', type: 'number', step: '0.01', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true }
    ];

    const form = UI.createForm(fields, 'Add Product', 'PageLogic.handleAddProduct(event)');
    const modal = UI.createModal('Add New Product', form);

    document.getElementById('modalContainer').innerHTML = modal;
    lucide.createIcons();
},

   async handleAddProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const productData = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        type: formData.get('type'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity'))
    };

    try {
        await apiService.createProduct(productData);
        UI.showToast('Product added successfully!', 'success');
        document.getElementById('modalContainer').innerHTML = '';
        this.showInventory(); // Refresh the inventory page
    } catch (error) {
        console.error('Add product error:', error);
        UI.showToast('Error adding product: ' + error.message, 'error');
    }
},

    editProduct(id) {
        UI.showToast('Edit functionality will be implemented', 'info');
    },

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await apiService.deleteProduct(id);
                UI.showToast('Product deleted successfully!', 'success');
                this.showInventory();
            } catch (error) {
                console.error('Delete product error:', error);
                UI.showToast('Error deleting product: ' + error.message, 'error');
            }
        }
    },

    addCustomer() {
        const fields = [
            { name: 'name', label: 'Customer Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'tel' },
            { name: 'address', label: 'Address', type: 'textarea' }
        ];

        const form = UI.createForm(fields, 'Add Customer', 'PageLogic.handleAddCustomer(event)');
        const modal = UI.createModal('Add New Customer', form);
        
        document.getElementById('modalContainer').innerHTML = modal;
        lucide.createIcons();
    },

    async handleAddCustomer(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const customerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };

        try {
            await apiService.createCustomer(customerData);
            UI.showToast('Customer added successfully!', 'success');
            document.getElementById('modalContainer').innerHTML = '';
            this.showCustomers();
        } catch (error) {
            console.error('Add customer error:', error);
            UI.showToast('Error adding customer: ' + error.message, 'error');
        }
    },

    async showSales() {
        document.getElementById('pageTitle').textContent = 'Sales Management';
        document.getElementById('mainContent').innerHTML = UI.showLoading();

        try {
            const sales = await apiService.getSales();
            
            const salesContent = `
                <!-- Header Section -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sales Management</h2>
                        <p class="text-gray-600">Track your sales performance and manage transactions</p>
                    </div>
                    <button onclick="PageLogic.addSale()" class="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                        <i data-lucide="plus" class="h-5 w-5 mr-2"></i>
                        New Sale
                    </button>
                </div>

                ${sales.length > 0 ? `
                    <!-- Sales Table -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Sales</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${sales.map(sale => `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#${sale.id}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-gray-900">${sale.customer_name || 'N/A'}</td>
                                            <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900">$${parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${new Date(sale.created_at).toLocaleDateString()}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex space-x-2">
                                                    <button onclick="PageLogic.editSale('${sale.id}')" class="text-blue-600 hover:text-blue-900">
                                                        <i data-lucide="edit" class="h-4 w-4"></i>
                                                    </button>
                                                    <button onclick="PageLogic.deleteSale('${sale.id}')" class="text-red-600 hover:text-red-900">
                                                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : `
                    <!-- Empty State -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="shopping-cart" class="h-12 w-12 text-green-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">No sales yet</h3>
                        <p class="text-gray-500 mb-6">Get started by recording your first sale.</p>
                        <button onclick="PageLogic.addSale()" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                            <i data-lucide="shopping-cart" class="h-5 w-5 mr-2"></i>
                            Record Your First Sale
                        </button>
                    </div>
                `}
            `;

            document.getElementById('mainContent').innerHTML = salesContent;
            lucide.createIcons();
        } catch (error) {
            console.error('Sales error:', error);
            UI.showToast('Error loading sales', 'error');
        }
    },

    async addSale() {
        try {
            const [products, customers] = await Promise.all([
                apiService.getProducts(),
                apiService.getCustomers().catch(() => [])
            ]);

            const fields = [
                {
                    name: 'customer_id',
                    label: 'Customer',
                    type: 'select',
                    options: customers.map(c => ({ value: c.id, label: c.name }))
                },
                {
                    name: 'product_id',
                    label: 'Product',
                    type: 'select',
                    required: true,
                    options: products.map(p => ({ value: p.id, label: `${p.name} - $${p.price}` }))
                },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true, value: '1' },
                { name: 'total_amount', label: 'Total Amount', type: 'number', step: '0.01', required: true }
            ];

            const form = UI.createForm(fields, 'Record Sale', 'PageLogic.handleAddSale(event)');
            const modal = UI.createModal('New Sale', form);
            
            document.getElementById('modalContainer').innerHTML = modal;
            lucide.createIcons();
        } catch (error) {
            console.error('Error loading sale form:', error);
            UI.showToast('Error loading form data', 'error');
        }
    },

    // In frontend/js/pageLogic.js
// Find the function handleAddSale(event) and REPLACE it with this:

async handleAddSale(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const customerId = parseInt(formData.get('customer_id'));
    const productId = parseInt(formData.get('product_id'));
    const quantity = parseInt(formData.get('quantity'));
    const totalAmount = parseFloat(formData.get('total_amount'));

    // Basic validation on the frontend
    if (!customerId || !productId || !quantity || !totalAmount) {
        UI.showToast('Please fill out all sale details.', 'error');
        return;
    }

    const priceAtSale = totalAmount / quantity; // Calculate price per item

    // This is the CORRECT data structure the backend needs
    const saleData = {
        customer_id: customerId,
        total_amount: totalAmount,
        items: [{
            product_id: productId,
            quantity: quantity,
            price_at_sale: priceAtSale
        }]
    };

    try {
        await apiService.createSale(saleData);
        UI.showToast('Sale recorded successfully!', 'success');
        document.getElementById('modalContainer').innerHTML = ''; // Close the modal
        this.showSales(); // Refresh the sales page
    } catch (error) {
        console.error('Add sale error:', error);
        UI.showToast('Error recording sale: ' + error.message, 'error');
    }
},
};

// Make PageLogic globally available
window.PageLogic = PageLogic;
