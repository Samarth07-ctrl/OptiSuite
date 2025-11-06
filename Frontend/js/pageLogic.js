import apiService from './apiService.js';
import { UI } from './ui.js';

// Helper to safely render icons
function safeCreateIcons() {
    if (typeof window.lucide !== 'undefined') {
        window.lucide.createIcons();
    } else {
        console.warn("Lucide not ready, skipping icon render.");
    }
}

export const PageLogic = {
    navigateToPage(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active'); // Use 'active' class defined in CSS
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        const pageFunctions = {
            'employee-pos': this.showEmployeePOS,
            'dashboard': this.showDashboard,
            'inventory': this.showInventory,
            'customers': this.showCustomers,
            'sales': this.showSales,
            'reports': this.showReports,
        };
        const func = pageFunctions[page] || this.showDashboard;
        func.call(this); // Use .call(this) to maintain context
    },

    // --- PAGE RENDERING FUNCTIONS ---

    async showDashboard() {
        document.getElementById('pageTitle').textContent = 'Dashboard';
        document.getElementById('mainContent').innerHTML = UI.showLoading();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user.role === 'admin';
        try {
            const products = await apiService.getProducts();
            const sales = isAdmin ? await apiService.getSales() : [];
            const customers = isAdmin ? await apiService.getCustomers() : [];
            const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
            const lowStockItems = products.filter(p => (p.quantity || 0) < 10);
            const statCards = [
                { label: 'Total Products', value: products.length, icon: 'package' },
                { label: 'Total Customers', value: isAdmin ? customers.length : 'N/A', icon: 'users' },
                { label: 'Total Revenue', value: isAdmin ? UI.formatCurrency(totalRevenue) : 'N/A', icon: 'dollar-sign' },
                { label: 'Low Stock Items', value: lowStockItems.length, icon: 'alert-triangle' }
            ];
            document.getElementById('mainContent').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${statCards.map(stat => `<div class="glass-card p-6"><div class="flex items-center justify-between"><span class="text-sm font-medium text-[hsl(var(--c-text-subtle))]">${stat.label}</span><i data-lucide="${stat.icon}" class="w-5 h-5 text-[hsl(var(--c-text-subtle))]"></i></div><p class="text-3xl font-bold mt-2">${stat.value}</p></div>`).join('')}
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div class="lg:col-span-2 glass-card p-6">
                        <h3 class="font-semibold mb-4 text-lg">Recent Sales</h3>
                        ${isAdmin && sales.length > 0 ? `<div class="space-y-3">${sales.slice(0, 5).map(s => `<div class="flex justify-between items-center p-3 rounded-lg hover:bg-[hsla(var(--c-primary),0.05)] transition-colors"><div><p class="font-medium">${s.customer_name}</p><p class="text-xs text-[hsl(var(--c-text-subtle))]">${new Date(s.sale_date).toLocaleDateString()}</p></div><p class="font-semibold">${UI.formatCurrency(s.total_amount)}</p></div>`).join('')}</div>` : `<p class="text-[hsl(var(--c-text-subtle))] text-center py-8">No sales data available.</p>`}
                    </div>
                    <div class="glass-card p-6">
                        <h3 class="font-semibold mb-4 text-lg">Quick Actions</h3>
                        <div class="space-y-3">
                            <button onclick="PageLogic.navigateToPage('employee-pos')" class="btn btn-secondary w-full !justify-start"><i data-lucide="shopping-cart" class="w-4 h-4 mr-2"></i>New Sale</button>
                            ${isAdmin ? `<button onclick="PageLogic.addProduct()" class="btn btn-secondary w-full !justify-start"><i data-lucide="plus" class="w-4 h-4 mr-2"></i>Add Product</button>` : ''}
                            ${isAdmin ? `<button onclick="PageLogic.addCustomer()" class="btn btn-secondary w-full !justify-start"><i data-lucide="user-plus" class="w-4 h-4 mr-2"></i>Add Customer</button>` : ''}
                        </div>
                    </div>
                </div>`;
            safeCreateIcons();
        } catch (e) { console.error("Dashboard Error:", e); UI.showToast("Error loading dashboard data.", "error"); }
    },

    async showInventory() {
        document.getElementById('pageTitle').textContent = 'Inventory';
        document.getElementById('mainContent').innerHTML = UI.showLoading();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            const products = await apiService.getProducts();
            let currentCategory = 'All'; // State to track the active filter
            let currentSearch = '';      // State to track the search term

            // Main function to render the product grid
            const renderFilteredGrid = () => {
                const categoryFiltered = (currentCategory === 'All')
                    ? products
                    : products.filter(p => p.type === currentCategory);
                
                const searchFiltered = (currentSearch === '')
                    ? categoryFiltered
                    : categoryFiltered.filter(p =>
                        p.name.toLowerCase().includes(currentSearch) ||
                        (p.brand && p.brand.toLowerCase().includes(currentSearch)) ||
                        (p.barcode && p.barcode.toLowerCase().includes(currentSearch))
                    );
                
                document.getElementById('inventoryProductGrid').innerHTML = this.renderProductCards(searchFiltered, user.role);
                safeCreateIcons();

                document.querySelectorAll('.filter-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.category === currentCategory);
                });
            };

            const categories = ['All', 'Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories'];

            document.getElementById('mainContent').innerHTML = `
                <div class="glass-card p-6">
                    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <h2 class="text-xl font-semibold">Products (${products.length})</h2>
                        ${user.role === 'admin' ? `<button onclick="PageLogic.addProduct()" class="btn btn-primary flex-shrink-0"><i data-lucide="plus" class="w-4 h-4 mr-2"></i>Add Product</button>` : ''}
                    </div>

                    <div class="mb-4 flex flex-wrap gap-2 border-b border-[hsl(var(--c-border))] pb-2">
                        ${categories.map(cat => `
                            <button class="filter-tab btn btn-secondary !py-1.5 !px-4" data-category="${cat}">
                                ${cat}
                            </button>
                        `).join('')}
                    </div>

                    <div class="mb-6 relative">
                         <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--c-text-subtle))] pointer-events-none"></i>
                        <input type="text" id="inventorySearch" placeholder="Search within 'All'..." class="pl-10 w-full md:w-64">
                    </div>
                    
                    <div id="inventoryProductGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Content will be rendered by renderFilteredGrid */}
                    </div>
                </div>`;
            
            // Add Event Listeners
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    currentCategory = tab.dataset.category;
                    document.getElementById('inventorySearch').placeholder = `Search within '${currentCategory}'...`;
                    renderFilteredGrid();
                });
            });

            document.getElementById('inventorySearch')?.addEventListener('input', (e) => {
                 currentSearch = e.target.value.toLowerCase();
                 renderFilteredGrid();
            });
            
            renderFilteredGrid(); // Initial render
            safeCreateIcons();
        } catch (e) { console.error("Inventory Error:", e); UI.showToast("Error loading inventory", "error");}
    },

    renderProductCards(products, userRole) {
         if (!products || products.length === 0) { return `<p class="col-span-full text-center text-[hsl(var(--c-text-subtle))] py-8">No products found.</p>`; }
        return products.map(p => `
            <div class="glass-card p-4 flex flex-col transition-all hover:shadow-lg border border-transparent hover:border-[hsl(var(--c-border))]">
                <div class="flex-1 mb-3">
                    <p class="font-semibold">${p.name}</p>
                    <p class="text-sm text-[hsl(var(--c-text-subtle))]">${p.brand || ''} ${p.color ? `(${p.color})` : ''}</p>
                    ${p.frame_size ? `<p class="text-xs text-[hsl(var(--c-text-subtle))] mt-1">Size: ${p.frame_size}</p>` : ''}
                    ${p.material ? `<p class="text-xs text-[hsl(var(--c-text-subtle))] mt-1">Material: ${p.material}</p>` : ''}
                    <p class="mt-2 text-lg font-bold text-[hsl(var(--c-primary))]">${UI.formatCurrency(p.price)}</p>
                    ${p.barcode ? `<p class="text-xs text-[hsl(var(--c-text-subtle))] mt-1 truncate">Barcode: ${p.barcode}</p>` : ''}
                </div>
                <div class="flex justify-between items-center mt-auto pt-3 border-t border-[hsl(var(--c-border))]">
                    <span class="text-sm font-medium text-[hsl(var(--c-text-subtle))]">Stock: ${p.quantity}</span>
                    ${userRole === 'admin' ? `
                        <div class="flex gap-1">
                            <button onclick="PageLogic.editProduct('${p.id}')" class="p-2 rounded-full hover:bg-[hsla(var(--c-primary),0.1)]" title="Edit"><i data-lucide="edit-3" class="w-4 h-4 text-[hsl(var(--c-primary))]"></i></button>
                            <button onclick="PageLogic.deleteProduct('${p.id}')" class="p-2 rounded-full hover:bg-[hsla(0,72%,51%,0.1)]" title="Delete"><i data-lucide="trash-2" class="w-4 h-4 text-[hsl(var(--c-danger))]"></i></button>
                        </div>
                    ` : ''}
                </div>
            </div>`).join('');
    },
    
    async showCustomers() {
        document.getElementById('pageTitle').textContent = 'Customers';
        document.getElementById('mainContent').innerHTML = UI.showLoading();
        try {
            const customers = await apiService.getCustomers();
            document.getElementById('mainContent').innerHTML = `
                 <div class="glass-card p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Customers (${customers.length})</h2>
                        <button onclick="PageLogic.addCustomer()" class="btn btn-primary"><i data-lucide="plus" class="w-4 h-4 mr-2"></i>Add Customer</button>
                    </div>
                    <div class="space-y-3">
                        ${customers.map(c => `
                            <div class="flex justify-between items-center p-4 glass-card border-transparent transition-all hover:shadow-lg hover:border-[hsl(var(--c-border))]">
                                <div>
                                    <p class="font-semibold">${c.name}</p>
                                    <p class="text-sm text-[hsl(var(--c-text-subtle))]">${c.email || 'No email'} ${c.phone ? `| ${c.phone}` : ''}</p>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="PageLogic.showCustomerReport('${c.id}')" class="p-2 rounded-full hover:bg-[hsla(187,82%,42%,0.1)]" title="View Report"><i data-lucide="file-text" class="w-4 h-4 text-[hsl(var(--c-accent))]"></i></button>
                                    <button onclick="PageLogic.editCustomer('${c.id}')" class="p-2 rounded-full hover:bg-[hsla(var(--c-primary),0.1)]" title="Edit"><i data-lucide="edit-3" class="w-4 h-4 text-[hsl(var(--c-primary))]"></i></button>
                                    <button onclick="PageLogic.deleteCustomer('${c.id}')" class="p-2 rounded-full hover:bg-[hsla(0,72%,51%,0.1)]" title="Delete"><i data-lucide="trash-2" class="w-4 h-4 text-[hsl(var(--c-danger))]"></i></button>
                                </div>
                            </div>`).join('')}
                    </div>
                 </div>`;
            safeCreateIcons();
        } catch (e) { console.error("Customer Error:", e); UI.showToast('Error loading customers', 'error');}
    },

    async showSales() {
        document.getElementById('pageTitle').textContent = 'Sales History';
        document.getElementById('mainContent').innerHTML = UI.showLoading();
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user.role === 'admin';

        try {
            const sales = await apiService.getSales();
            const statuses = ['Processing', 'Lens Ordered', 'Ready for Pickup', 'Completed'];

            const createStatusSelector = (sale) => {
                if (!isAdmin) {
                    return `<span class="font-medium text-sm text-[hsl(var(--c-text-subtle))]">${sale.status}</span>`;
                }
                const options = statuses.map(s => 
                    `<option value="${s}" ${s === sale.status ? 'selected' : ''}>${s}</option>`
                ).join('');
                return `
                    <select class="status-dropdown text-sm p-1 rounded border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))]" data-sale-id="${sale.id}">
                        ${options}
                    </select>
                `;
            };

            document.getElementById('mainContent').innerHTML = `
                <div class="glass-card p-6">
                    <h2 class="text-xl font-semibold mb-4">Sales History (${sales.length})</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-[hsl(var(--c-border))]">
                                    <th class="p-3 font-semibold">ID</th>
                                    <th class="p-3 font-semibold">Customer</th>
                                    <th class="p-3 font-semibold">Date</th>
                                    <th class="p-3 font-semibold text-right">Amount</th>
                                    <th class="p-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.map(s => `
                                    <tr class="border-b border-[hsl(var(--c-border))] hover:bg-[hsla(var(--c-primary),0.05)]">
                                        <td class="p-3 text-sm">#${s.id}</td>
                                        <td class="p-3 font-medium">${s.customer_name}</td>
                                        <td class="p-3 text-sm">${new Date(s.sale_date).toLocaleDateString()}</td>
                                        <td class="p-3 text-right font-semibold">${UI.formatCurrency(s.total_amount)}</td>
                                        <td class="p-3">${createStatusSelector(s)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            
            if (isAdmin) {
                document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                    dropdown.addEventListener('change', async (e) => {
                        const saleId = e.target.dataset.saleId;
                        const newStatus = e.target.value;
                        try {
                            await apiService.updateSaleStatus(saleId, newStatus);
                            UI.showToast(`Sale #${saleId} status updated to ${newStatus}`, 'success');
                        } catch (error) {
                            console.error('Failed to update status:', error);
                            UI.showToast('Failed to update status', 'error');
                            e.target.value = sales.find(s => s.id == saleId).status; // Revert on failure
                        }
                    });
                });
            }
            safeCreateIcons(); 
        } catch (e) { 
            console.error("Sales Error:", e); 
            UI.showToast('Error loading sales', 'error'); 
        }
    },

    async showReports() {
        document.getElementById('pageTitle').textContent = 'Analytics Dashboard';
        document.getElementById('mainContent').innerHTML = UI.showLoading();
        
        try {
            const reportData = await apiService.getFullReport();
            const { salesOverTime, salesByType, bestSellers, totalProfit } = reportData;

            const reportHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div class="lg:col-span-4 glass-card p-6">
                        <div class="flex items-center gap-4">
                            <i data-lucide="trending-up" class="w-8 h-8 text-[hsl(var(--c-primary))]"></i>
                            <div>
                                <span class="text-sm font-medium text-[hsl(var(--c-text-subtle))]">Total Calculated Profit</span>
                                <p class="text-3xl font-bold">${UI.formatCurrency(totalProfit)}</p>
                            </div>
                        </div>
                        <p class="text-xs text-[hsl(var(--c-text-subtle))] mt-2">*Based on products with a valid 'Purchase Rate' entered.</p>
                    </div>
                    <div class="lg:col-span-3 glass-card p-6">
                        <h3 class="font-semibold mb-4 text-lg">Revenue (Last 30 Days)</h3>
                        <div id="salesOverTimeChart" class="h-96"></div>
                    </div>
                    <div class="lg:col-span-1 glass-card p-6">
                        <h3 class="font-semibold mb-4 text-lg">Revenue by Type</h3>
                        <div id="salesByTypeChart" class="h-96"></div>
                    </div>
                    <div class="lg:col-span-4 glass-card p-6">
                        <h3 class="font-semibold mb-4 text-lg">Top 10 Best Sellers (by Units Sold)</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="border-b border-[hsl(var(--c-border))]"><th class="p-3 font-semibold">Product</th><th class="p-3 font-semibold">Brand</th><th class="p-3 font-semibold text-right">Units Sold</th><th class="p-3 font-semibold text-right">Total Revenue</th></tr>
                                </thead>
                                <tbody>
                                    ${bestSellers.map(item => `
                                        <tr class="border-b border-[hsl(var(--c-border))] hover:bg-[hsla(var(--c-primary),0.05)]">
                                            <td class="p-3 font-medium">${item.product_name}</td>
                                            <td class="p-3 text-[hsl(var(--c-text-subtle))]">${item.product_brand || 'N/A'}</td>
                                            <td class="p-3 text-right font-semibold text-lg">${item.total_units_sold}</td>
                                            <td class="p-3 text-right font-semibold text-[hsl(var(--c-primary))]">${UI.formatCurrency(item.total_revenue)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('mainContent').innerHTML = reportHTML;
            safeCreateIcons();

            // Render charts
            const isDarkMode = document.documentElement.classList.contains('dark');
            this.renderApexSalesChart(salesOverTime, isDarkMode);
            this.renderApexTypeChart(salesByType, isDarkMode);

        } catch (e) { 
            console.error("Reports Error:", e); 
            UI.showToast('Error loading reports', 'error');
            document.getElementById('mainContent').innerHTML = `<p class="text-red-500">Could not load reports.</p>`;
        }
    },

    // ** REPLACE renderSalesChart with this **
    renderApexSalesChart(data, isDarkMode) {
        const chartEl = document.getElementById('salesOverTimeChart');
        if (!chartEl) return;

        const options = {
            chart: {
                type: 'area',
                height: '100%',
                background: 'transparent',
                toolbar: { show: false },
                sparkline: { enabled: false },
            },
            series: [{
                name: 'Revenue',
                data: data.map(d => d.daily_revenue)
            }],
            xaxis: {
                categories: data.map(d => new Date(d.sale_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
                labels: {
                    style: {
                        colors: isDarkMode ? '#64748b' : '#64748b' // slate-500
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: isDarkMode ? '#64748b' : '#64748b' // slate-500
                    },
                    formatter: (value) => { return `₹${value.toFixed(0)}` }
                }
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                }
            },
            grid: {
                borderColor: isDarkMode ? 'hsl(var(--dm-c-border))' : 'hsl(var(--lm-c-border))',
                strokeDashArray: 4
            },
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light'
            },
            colors: ['hsl(var(--c-primary))']
        };

        const chart = new ApexCharts(chartEl, options);
        chart.render();
    },

    // ** REPLACE renderTypeChart with this **
    renderApexTypeChart(data, isDarkMode) {
        const chartEl = document.getElementById('salesByTypeChart');
        if (!chartEl) return;

        const options = {
            chart: {
                type: 'donut',
                height: '100%',
                background: 'transparent'
            },
            series: data.map(d => d.type_revenue),
            labels: data.map(d => d.type),
            colors: [
                'hsla(var(--c-primary), 0.8)',
                'hsla(var(--c-accent), 0.8)',
                'hsla(var(--c-primary), 0.6)',
                'hsla(var(--c-accent), 0.6)',
                'hsla(var(--c-primary), 0.4)',
            ],
            legend: {
                position: 'bottom',
                labels: {
                    colors: isDarkMode ? 'hsl(var(--dm-c-text-subtle))' : 'hsl(var(--lm-c-text-subtle))'
                }
            },
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light'
            },
            stroke: {
                 show: false
            }
        };

        const chart = new ApexCharts(chartEl, options);
        chart.render();
    },

    renderSalesChart(data, isDarkMode) {
        const ctx = document.getElementById('salesOverTimeChart');
        if (!ctx) return;
        const gridColor = isDarkMode ? 'hsla(var(--dm-c-border), 0.5)' : 'hsla(var(--lm-c-border), 0.5)';
        const textColor = isDarkMode ? 'hsl(var(--dm-c-text-subtle))' : 'hsl(var(--lm-c-text-subtle))';
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.sale_date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Revenue',
                    data: data.map(d => d.daily_revenue),
                    fill: true,
                    backgroundColor: 'hsla(var(--c-primary), 0.1)',
                    borderColor: 'hsl(var(--c-primary))',
                    tension: 0.3,
                    pointBackgroundColor: 'hsl(var(--c-primary))'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
                },
                plugins: { legend: { display: false } }
            }
        });
    },

    renderTypeChart(data, isDarkMode) {
        const ctx = document.getElementById('salesByTypeChart');
        if (!ctx) return;
        const textColor = isDarkMode ? 'hsl(var(--dm-c-text-subtle))' : 'hsl(var(--lm-c-text-subtle))';
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    label: 'Revenue by Type',
                    data: data.map(d => d.type_revenue),
                    backgroundColor: [ 'hsla(var(--c-primary), 0.8)', 'hsla(var(--c-accent), 0.8)', 'hsla(var(--c-primary), 0.5)', 'hsla(var(--c-accent), 0.5)', 'hsla(var(--c-primary), 0.3)', ],
                    borderColor: 'hsl(var(--c-surface))',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor } }
                }
            }
        });
    },

    async showEmployeePOS() {
        document.getElementById('pageTitle').textContent = 'Point of Sale';
        document.getElementById('mainContent').innerHTML = UI.showLoading(); 
        try {
            const response = await fetch('pages/employee-pos-page.html');
            if (!response.ok) throw new Error('Failed to load page');
            const pageContent = await response.text();
            document.getElementById('mainContent').innerHTML = pageContent;
            safeCreateIcons();
            this.initPOS(); 
        } catch (error) { console.error("POS Error:", error); UI.showToast('Error loading Point of Sale', 'error');}
    },

    async initPOS() {
        const productListEl = document.getElementById('productList');
        const customerSearchEl = document.getElementById('customerSearch');
        const cartItemsEl = document.getElementById('cartItems');
        const cartTotalEl = document.getElementById('cartTotal');
        const completeSaleBtn = document.getElementById('completeSaleBtn');
        const productSearchInput = document.getElementById('productSearch');
        const addNewCustomerBtn = document.getElementById('addNewCustomerBtn');
        let products = [], customers = [], cart = [];

        const renderProducts = (filter = '') => {
            const lowerFilter = filter.toLowerCase();
            const filteredProducts = products.filter(p => p.name.toLowerCase().includes(lowerFilter) || (p.brand && p.brand.toLowerCase().includes(lowerFilter)) || (p.barcode && p.barcode.toLowerCase().includes(lowerFilter)));
            productListEl.innerHTML = filteredProducts.map(p => `<div class="flex items-center justify-between p-2 rounded-lg hover:bg-[hsla(var(--c-primary),0.05)] cursor-pointer" data-product-id="${p.id}"><div><p class="font-medium">${p.name}</p><p class="text-sm text-[hsl(var(--c-text-subtle))]">${p.brand} - Stock: ${p.quantity}</p></div><span class="font-semibold text-[hsl(var(--c-primary))]">${UI.formatCurrency(p.price)}</span></div>`).join('') || `<p class="text-[hsl(var(--c-text-subtle))] p-4">No products found.</p>`;
            safeCreateIcons();
        };
        
        const renderCart = () => {
             if (cart.length === 0) { cartItemsEl.innerHTML = `<div class="text-center text-[hsl(var(--c-text-subtle))] py-10"><i data-lucide="shopping-cart" class="mx-auto h-12 w-12 text-[hsl(var(--c-border))]"></i><p>Cart is empty</p></div>`; } else { cartItemsEl.innerHTML = cart.map(item => `<div class="flex items-center justify-between p-2 bg-[hsl(var(--c-bg))] rounded-md"><div><p class="font-medium">${item.name}</p><p class="text-sm text-[hsl(var(--c-text-subtle))]">${UI.formatCurrency(item.price)} x ${item.quantity}</p></div><div class="font-semibold">${UI.formatCurrency(item.price * item.quantity)}</div></div>`).join(''); } const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); cartTotalEl.textContent = UI.formatCurrency(total); completeSaleBtn.disabled = cart.length === 0 || !customerSearchEl.value; safeCreateIcons();
        };
        
        const addToCart = (product) => {
            if (!product) return;
            if (product.quantity <= 0) { UI.showToast('Product is out of stock.', 'warning'); return; };
            const existingItem = cart.find(cartItem => cartItem.id === product.id && cartItem.price === product.price);
            if (existingItem) {
                const productStock = products.find(p => p.id === product.id);
                if (existingItem.quantity < productStock.quantity) { existingItem.quantity++; } else { UI.showToast('No more stock available.', 'warning'); }
            } else { cart.push({ ...product, quantity: 1 }); }
            renderCart();
        };

        const showProductOptionsModal = (product) => {
            const modalContent = `
                <div class="space-y-4">
                    <p class="font-medium">Product: <strong class="text-[hsl(var(--c-text))]">${product.name}</strong></p>
                    <p class="font-medium">Base Price: <strong class="text-[hsl(var(--c-text))]">${UI.formatCurrency(product.price)}</strong></p>
                    <hr class="border-[hsl(var(--c-border))]">
                    <div>
                        <label for="addon_name" class="block text-sm font-medium text-[hsl(var(--c-text-subtle))] mb-1">Add-on Name (e.g., Fitting Fee)</label>
                        <input type="text" id="modal_addon_name" placeholder="Fitting Fee" class="w-full">
                    </div>
                    <div>
                        <label for="addon_price" class="block text-sm font-medium text-[hsl(var(--c-text-subtle))] mb-1">Add-on Price (₹)</label>
                        <input type="number" id="modal_addon_price" value="0" step="0.01" class="w-full">
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--c-border))]">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
                        <button type="button" id="modal_add_to_cart_btn" class="btn btn-primary">Add Item to Cart</button>
                    </div>
                </div>
            `;
            UI.showModal('Customize Product / Add Fees', modalContent, 'md');
            document.getElementById('modal_add_to_cart_btn').addEventListener('click', () => {
                const addOnName = document.getElementById('modal_addon_name').value;
                const addOnPrice = parseFloat(document.getElementById('modal_addon_price').value) || 0;
                const customItem = { ...product, name: addOnName ? `${product.name} (${addOnName})` : product.name, price: parseFloat(product.price) + addOnPrice, };
                addToCart(customItem);
                document.querySelector('.modal-backdrop').remove();
            });
        };

        async function handleCompleteSale() {
            const customer_id = parseInt(customerSearchEl.value); if (!customer_id) { UI.showToast('Please select a customer.', 'error'); return; }
            completeSaleBtn.textContent = 'Processing...'; completeSaleBtn.disabled = true; 
            const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); 
            const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity, price_at_sale: item.price })); 
            const saleData = { customer_id, total_amount, items };
            try { 
                const newSale = await apiService.createSale(saleData); 
                UI.showToast('Sale completed!', 'success'); 
                cart = []; renderCart(); 
                products = await apiService.getProducts(); 
                renderProducts(productSearchInput.value); 
                
                const customer = customers.find(c => c.id === customer_id);
                if (customer && customer.allow_whatsapp == 1 && customer.phone) {
                    try {
                        // Note: This relies on apiService having sendTemplateMessage
                        // We will add this function in the next step
                        console.log("Attempting to send WhatsApp receipt..."); // Debug log
                        // await apiService.sendTemplateMessage(customer.phone, 'order_receipt', [customer.name, UI.formatCurrency(total_amount), newSale.id]);
                    } catch (waError) {
                        console.error("WhatsApp notification failed:", waError);
                        UI.showToast("Sale saved, but WhatsApp notification failed.", "warning");
                    }
                }
            } catch (error) { 
                UI.showToast(`Sale failed: ${error.message}`, 'error'); 
            } finally { 
                completeSaleBtn.textContent = 'Complete Sale'; 
                renderCart(); 
            }
        }
        
        try {
            [products, customers] = await Promise.all([apiService.getProducts(), apiService.getCustomers()]);
            renderProducts();
            if (customerSearchEl.options.length <= 1) { customerSearchEl.innerHTML += customers.map(c => `<option value="${c.id}">${c.name} (${c.email || 'No Email'})</option>`).join(''); }
        } catch (error) { UI.showToast('Could not load store data', 'error'); }
        
        productSearchInput?.addEventListener('input', (e) => renderProducts(e.target.value));
        productListEl?.addEventListener('click', (e) => { 
            const productEl = e.target.closest('[data-product-id]'); 
            if (!productEl) return;
            const product = products.find(p => p.id === parseInt(productEl.dataset.productId)); 
            if (!product) return;
            if (product.type === 'Lenses' || product.type === 'Contact Lenses') {
                showProductOptionsModal(product);
            } else {
                addToCart(product); 
            }
        });
        customerSearchEl?.addEventListener('change', () => renderCart());
        completeSaleBtn?.addEventListener('click', handleCompleteSale);
        addNewCustomerBtn?.addEventListener('click', () => {
            const fields = [{ name: 'name', label: 'Customer Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Phone (e.g. +9198...)' , type: 'tel' }];
            window.handleAddNewPOSCustomer = async (event) => {
                event.preventDefault(); const form = event.target; const submitButton = form.querySelector('button[type="submit"]'); submitButton.textContent = 'Adding...'; submitButton.disabled = true;
                const formData = new FormData(form); const customerData = { name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone') };
                try { const newCustomer = await apiService.createCustomer(customerData); UI.showToast('Customer added successfully!', 'success'); const newOption = new Option(`${newCustomer.name} (${newCustomer.email || 'No Email'})`, newCustomer.id, true, true); customerSearchEl.add(newOption); customerSearchEl.value = newCustomer.id; renderCart(); document.querySelector('.modal-backdrop').remove(); } catch (error) { UI.showToast(`Error: ${error.message}`, 'error'); submitButton.textContent = 'Add Customer'; submitButton.disabled = false; } delete window.handleAddNewPOSCustomer;
            }; const form = UI.createForm(fields, 'Add Customer', 'window.handleAddNewPOSCustomer(event)'); UI.showModal('Add New Customer', form);
        });
    },

    // --- ACTION FUNCTIONS (CRUD) ---

    addProduct() {
        const fields = [
            { name: 'name', label: 'Product Name', type: 'text', required: true },
            { name: 'brand', label: 'Brand', type: 'text' },
            { name: 'frame_size', label: 'Frame Size (e.g., 52-18-140)', type: 'text' },
            { name: 'material', label: 'Material', type: 'text' }, { name: 'color', label: 'Color', type: 'text' },
            { name: 'type', label: 'Type', type: 'select', required: true, options: ['Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories'].map(o => ({ value: o, label: o }))},
            { name: 'price', label: 'Selling Price (₹)', type: 'number', step: '0.01', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'barcode', label: 'Barcode (UPC/EAN)', type: 'text' }
        ];
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') {
            const quantityIndex = fields.findIndex(f => f.name === 'quantity');
            fields.splice(quantityIndex, 0, { name: 'purchase_rate', label: 'Purchase Rate (₹)', type: 'number', step: '0.01' });
        }
        window.handleAddProduct = async (event) => {
            event.preventDefault(); const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.textContent = 'Adding...'; submitButton.disabled = true; const formData = new FormData(event.target); const productData = Object.fromEntries(formData.entries());
            productData.price = parseFloat(productData.price); productData.quantity = parseInt(productData.quantity); if (productData.purchase_rate) { productData.purchase_rate = parseFloat(productData.purchase_rate); }
            try { await apiService.createProduct(productData); UI.showToast('Product added!', 'success'); document.querySelector('.modal-backdrop').remove(); this.showInventory(); } catch (error) { UI.showToast(`Error: ${error.message}`, 'error'); submitButton.textContent = 'Add Product'; submitButton.disabled = false; } delete window.handleAddProduct;
        };
        const form = UI.createForm(fields, 'Add Product', 'window.handleAddProduct(event)'); UI.showModal('Add New Product', form, 'lg');
    },

    async editProduct(id) {
        try {
            const product = await apiService.getProductById(id);
            if (!product) throw new Error('Product not found');
            let fields = [
                { name: 'name', label: 'Product Name', type: 'text', required: true, value: product.name },
                { name: 'brand', label: 'Brand', type: 'text', value: product.brand || '' },
                { name: 'frame_size', label: 'Frame Size', type: 'text', value: product.frame_size || '' },
                { name: 'material', label: 'Material', type: 'text', value: product.material || '' }, { name: 'color', label: 'Color', type: 'text', value: product.color || '' },
                { name: 'type', label: 'Type', type: 'select', required: true, options: ['Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories'].map(o => ({ value: o, label: o, selected: product.type === o }))},
                { name: 'price', label: 'Selling Price (₹)', type: 'number', step: '0.01', required: true, value: product.price },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true, value: product.quantity },
                { name: 'barcode', label: 'Barcode', type: 'text', value: product.barcode || '' }
            ];
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') {
                 const quantityIndex = fields.findIndex(f => f.name === 'quantity');
                 fields.splice(quantityIndex, 0, { name: 'purchase_rate', label: 'Purchase Rate (₹)', type: 'number', step: '0.01', value: product.purchase_rate || '' });
            }
            window.handleUpdateProduct = async (event) => {
                event.preventDefault(); const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.textContent = 'Saving...'; submitButton.disabled = true; const formData = new FormData(event.target); const productData = Object.fromEntries(formData.entries());
                productData.price = parseFloat(productData.price); productData.quantity = parseInt(productData.quantity); if (productData.purchase_rate) { productData.purchase_rate = parseFloat(productData.purchase_rate); } else { productData.purchase_rate = null; }
                try { await apiService.updateProduct(id, productData); UI.showToast('Product updated!', 'success'); document.querySelector('.modal-backdrop').remove(); this.showInventory(); } catch (error) { UI.showToast(`Update failed: ${error.message}`, 'error'); submitButton.textContent = 'Save Changes'; submitButton.disabled = false; } delete window.handleUpdateProduct;
            };
            const form = UI.createForm(fields, 'Save Changes', `window.handleUpdateProduct(event)`); UI.showModal(`Edit Product: ${product.name}`, form, 'lg');
        } catch (error) { UI.showToast(`Error fetching product: ${error.message}`, 'error'); }
    },

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) { try { await apiService.deleteProduct(id); UI.showToast('Product deleted!', 'success'); this.showInventory(); } catch (error) { UI.showToast('Error: ' + error.message, 'error'); } }
    },

    addCustomer() {
        const fields = [
            { name: 'name', label: 'Customer Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Phone (e.g. +9198...)' , type: 'tel' },
            { name: 'address', label: 'Address', type: 'textarea' },
            { name: 'allow_whatsapp', label: 'Allow WhatsApp notifications', type: 'checkbox', value: false },
            { type: 'divider', label: 'Prescription - Right Eye (OD)' },
            { name: 'od_sph', label: 'Sphere', type: 'text' }, { name: 'od_cyl', label: 'Cylinder', type: 'text' }, { name: 'od_axis', label: 'Axis', type: 'text' }, { name: 'od_add', label: 'Add', type: 'text' },
            { type: 'divider', label: 'Prescription - Left Eye (OS)' },
            { name: 'os_sph', label: 'Sphere', type: 'text' }, { name: 'os_cyl', label: 'Cylinder', type: 'text' }, { name: 'os_axis', label: 'Axis', type: 'text' }, { name: 'os_add', label: 'Add', type: 'text' },
            { type: 'divider', label: 'Other Details' },
            { name: 'pd', label: 'Pupillary Distance (PD)', type: 'text'}, { name: 'notes', label: 'Notes', type: 'textarea' },
        ];
        window.handleAddCustomer = async (event) => {
            event.preventDefault(); const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.textContent = 'Adding...'; submitButton.disabled = true; const formData = new FormData(event.target); const customerData = Object.fromEntries(formData.entries());
            customerData.allow_whatsapp = customerData.allow_whatsapp === 'on' ? 1 : 0;
            try { await apiService.createCustomer(customerData); UI.showToast('Customer added!', 'success'); document.querySelector('.modal-backdrop').remove(); this.showCustomers(); } catch (error) { UI.showToast(`Error: ${error.message}`, 'error'); submitButton.textContent = 'Add Customer'; submitButton.disabled = false; } delete window.handleAddCustomer;
        };
        const form = UI.createForm(fields, 'Add Customer', 'window.handleAddCustomer(event)'); UI.showModal('Add New Customer', form, 'lg');
    },

    async editCustomer(id) {
        try {
            const customer = await apiService.getCustomerById(id);
            if (!customer) throw new Error('Customer not found');
            const fields = [
                { name: 'name', label: 'Customer Name', type: 'text', required: true, value: customer.name },
                { name: 'email', label: 'Email', type: 'email', value: customer.email || '' }, { name: 'phone', label: 'Phone (e.g. +9198...)', type: 'tel', value: customer.phone || '' },
                { name: 'address', label: 'Address', type: 'textarea', value: customer.address || '' },
                { name: 'allow_whatsapp', label: 'Allow WhatsApp notifications', type: 'checkbox', value: customer.allow_whatsapp },
                { type: 'divider', label: 'Prescription - Right Eye (OD)' },
                { name: 'od_sph', label: 'Sphere', type: 'text', value: customer.od_sph || '' }, { name: 'od_cyl', label: 'Cylinder', type: 'text', value: customer.od_cyl || '' }, { name: 'od_axis', label: 'Axis', type: 'text', value: customer.od_axis || '' }, { name: 'od_add', label: 'Add', type: 'text', value: customer.od_add || '' },
                { type: 'divider', label: 'Prescription - Left Eye (OS)' },
                { name: 'os_sph', label: 'Sphere', type: 'text', value: customer.os_sph || '' }, { name: 'os_cyl', label: 'Cylinder', type: 'text', value: customer.os_cyl || '' }, { name: 'os_axis', label: 'Axis', type: 'text', value: customer.os_axis || '' }, { name: 'os_add', label: 'Add', type: 'text', value: customer.os_add || '' },
                { type: 'divider', label: 'Other Details' },
                { name: 'pd', label: 'Pupillary Distance (PD)', type: 'text', value: customer.pd || '' }, { name: 'notes', label: 'Notes', type: 'textarea', value: customer.notes || '' },
            ];
            window.handleUpdateCustomer = async (event) => {
                event.preventDefault(); const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.textContent = 'Saving...'; submitButton.disabled = true; const formData = new FormData(event.target); const customerData = Object.fromEntries(formData.entries());
                customerData.allow_whatsapp = customerData.allow_whatsapp === 'on' ? 1 : 0;
                try { await apiService.updateCustomer(id, customerData); UI.showToast('Customer updated!', 'success'); document.querySelector('.modal-backdrop').remove(); this.showCustomers(); } catch (error) { UI.showToast(`Update failed: ${error.message}`, 'error'); submitButton.textContent = 'Save Changes'; submitButton.disabled = false; } delete window.handleUpdateCustomer;
            };
            const form = UI.createForm(fields, 'Save Changes', `window.handleUpdateCustomer(event)`); UI.showModal(`Edit Customer: ${customer.name}`, form, 'lg');
        } catch (error) { UI.showToast(`Error fetching customer: ${error.message}`, 'error'); }
    },

    async deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try { await apiService.deleteCustomer(id); UI.showToast('Customer deleted!', 'success'); this.showCustomers(); } catch (error) { if (error.message && error.message.includes('foreign key constraint')) { UI.showToast('Cannot delete customer with existing sales records.', 'error'); } else { UI.showToast(`Error: ${error.message}`, 'error'); } }
        }
    },
    
    async showCustomerReport(id) {
        UI.showModal("Loading Report...", UI.showLoading(), 'lg');
        try {
            const reportData = await apiService.getCustomerReport(id);
            const { customer, sales } = reportData;
            const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
            const reportHTML = `
                <div class="space-y-6 text-sm">
                    <section>
                        <h4 class="font-semibold text-base mb-2 border-b border-[hsl(var(--c-border))] pb-1">Customer Information</h4>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div><strong>Name:</strong> ${customer.name}</div>
                            <div><strong>Email:</strong> ${customer.email || 'N/A'}</div>
                            <div><strong>Phone:</strong> ${customer.phone || 'N/A'}</div>
                            <div><strong>Added:</strong> ${formatDate(customer.date_added)}</div>
                            <div class="col-span-2"><strong>Address:</strong> ${customer.address || 'N/A'}</div>
                        </div>
                    </section>
                    <section>
                        <h4 class="font-semibold text-base mb-2 border-b border-[hsl(var(--c-border))] pb-1">Current Prescription</h4>
                         <div class="grid grid-cols-5 gap-x-4 gap-y-2 text-xs p-2 bg-[hsl(var(--c-bg))] rounded-lg">
                            <span class="font-medium"></span> <span class="font-medium">SPH</span> <span class="font-medium">CYL</span> <span class="font-medium">Axis</span> <span class="font-medium">Add</span>
                            <span class="font-medium">OD (Right)</span> <span>${customer.od_sph || '-'}</span> <span>${customer.od_cyl || '-'}</span> <span>${customer.od_axis || '-'}</span> <span>${customer.od_add || '-'}</span>
                            <span class="font-medium">OS (Left)</span>  <span>${customer.os_sph || '-'}</span> <span>${customer.os_cyl || '-'}</span> <span>${customer.os_axis || '-'}</span> <span>${customer.os_add || '-'}</span>
                         </div>
                         <div class="mt-2"><strong>PD:</strong> ${customer.pd || 'N/A'}</div>
                         ${customer.notes ? `<div class="mt-2"><strong>Notes:</strong><p class="text-[hsl(var(--c-text-subtle))] whitespace-pre-wrap">${customer.notes}</p></div>` : ''}
                    </section>
                    <section>
                        <h4 class="font-semibold text-base mb-2 border-b border-[hsl(var(--c-border))] pb-1">Purchase History (${sales.length})</h4>
                        ${sales.length > 0 ? `
                            <ul class="space-y-2 max-h-60 overflow-y-auto pr-2">
                                ${sales.map(sale => `
                                    <li class="p-3 rounded border border-[hsl(var(--c-border))] bg-[hsl(var(--c-bg))]">
                                        <div class="flex justify-between items-center font-medium">
                                            <span>Sale #${sale.id} - ${formatDate(sale.sale_date)}</span>
                                            <span>${UI.formatCurrency(sale.total_amount)}</span>
                                        </div>
                                        <p class="text-xs text-[hsl(var(--c-text-subtle))] mt-1 truncate">Items: ${sale.products_sold || 'Details unavailable'}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : `<p class="text-[hsl(var(--c-text-subtle))]">No purchase history found.</p>`}
                    </section>
                     <div class="flex justify-end mt-6 pt-4 border-t border-[hsl(var(--c-border))]">
                         <button onclick="window.print()" class="btn btn-secondary">
                             <i data-lucide="printer" class="w-4 h-4 mr-2"></i>Print Report
                         </button>
                    </div>
                </div>`;
            // Re-call showModal to replace loading with content
            UI.showModal(`Report for ${customer.name}`, reportHTML, 'lg');
        } catch (error) {
            console.error("Error fetching customer report:", error);
            UI.showToast(`Error: ${error.message}`, 'error');
            const modalContent = document.querySelector('.modal-backdrop .glass-card > div:last-child');
            if (modalContent) modalContent.innerHTML = `<p class="text-red-500">Could not load report data.</p>`;
        }
    },
};

// Make globally accessible
window.PageLogic = PageLogic;