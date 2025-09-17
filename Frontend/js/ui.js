export const UI = {
    showLoading() {
        return '<div class="flex justify-center items-center py-12"><div class="spinner"></div></div>';
    },

    showToast(message, type = 'info') {
        const toastId = `toast-${Date.now()}`;
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const toast = `
            <div id="${toastId}" class="toast ${colors[type]} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 slide-in">
                <i data-lucide="${icons[type]}" class="h-5 w-5"></i>
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
        `;

        const container = document.getElementById('toastContainer');
        container.insertAdjacentHTML('beforeend', toast);
        
        // Initialize Lucide icons
        setTimeout(() => lucide.createIcons(), 0);

        // Auto remove after 5 seconds
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.classList.add('slide-out');
                setTimeout(() => toastElement.remove(), 300);
            }
        }, 5000);
    },

    createModal(title, content, size = 'md') {
        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-2xl',
            lg: 'max-w-4xl',
            xl: 'max-w-6xl'
        };

        return `
            <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 fade-in" onclick="this.remove()">
                <div class="bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                        <button onclick="this.closest('.modal-backdrop').remove()" class="text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="h-6 w-6"></i>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto max-h-[70vh]">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    },

    createTable(headers, rows, actions = []) {
        const headerCells = headers.map(header => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`).join('');
        const actionsHeader = actions.length > 0 ? '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>' : '';

        const tableRows = rows.map(row => {
            const cells = row.cells.map(cell => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cell}</td>`).join('');
            const actionButtons = actions.map(action => 
                `<button onclick="${action.onclick}('${row.id}')" class="text-${action.color}-600 hover:text-${action.color}-900 mr-3">
                    <i data-lucide="${action.icon}" class="h-4 w-4"></i>
                </button>`
            ).join('');
            const actionsCell = actions.length > 0 ? `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${actionButtons}</td>` : '';

            return `<tr class="table-row border-b border-gray-200">${cells}${actionsCell}</tr>`;
        }).join('');

        return `
            <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>${headerCells}${actionsHeader}</tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    },

    createCard(title, content, actions = []) {
        const actionButtons = actions.map(action => 
            `<button onclick="${action.onclick}" class="bg-${action.color}-600 text-white px-4 py-2 rounded-lg hover:bg-${action.color}-700 transition-colors">
                <i data-lucide="${action.icon}" class="h-4 w-4 inline mr-2"></i>
                ${action.label}
            </button>`
        ).join('');

        return `
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    <div class="space-x-2">${actionButtons}</div>
                </div>
                ${content}
            </div>
        `;
    },

    createForm(fields, submitText = 'Submit', onSubmit = '') {
        const formFields = fields.map(field => {
            switch (field.type) {
                case 'select':
                    const options = field.options.map(opt => 
                        `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                    return `
                        <div class="mb-4">
                            <label for="${field.name}" class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
                            <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''} 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${options}
                            </select>
                        </div>
                    `;
                case 'textarea':
                    return `
                        <div class="mb-4">
                            <label for="${field.name}" class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
                            <textarea id="${field.name}" name="${field.name}" rows="3" ${field.required ? 'required' : ''}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="${field.placeholder || ''}">${field.value || ''}</textarea>
                        </div>
                    `;
                default:
                    return `
                        <div class="mb-4">
                            <label for="${field.name}" class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
                            <input type="${field.type}" id="${field.name}" name="${field.name}" 
                                value="${field.value || ''}" ${field.required ? 'required' : ''}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="${field.placeholder || ''}">
                        </div>
                    `;
            }
        }).join('');

        return `
            <form onsubmit="${onSubmit}">
                ${formFields}
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="this.closest('.modal-backdrop').remove()" 
                        class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        ${submitText}
                    </button>
                </div>
            </form>
        `;
    },

    createStatsGrid(stats) {
        return stats.map(stat => `
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${stat.color}-100 rounded-md flex items-center justify-center">
                            <i data-lucide="${stat.icon}" class="h-5 w-5 text-${stat.color}-600"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">${stat.label}</p>
                        <p class="text-2xl font-semibold text-gray-900">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    createEmptyState(title, description, action = null) {
        const actionButton = action ? 
            `<button onclick="${action.onclick}" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i data-lucide="${action.icon}" class="h-4 w-4 inline mr-2"></i>
                ${action.label}
            </button>` : '';

        return `
            <div class="text-center py-12">
                <i data-lucide="inbox" class="mx-auto h-12 w-12 text-gray-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">${title}</h3>
                <p class="mt-1 text-sm text-gray-500">${description}</p>
                ${actionButton}
            </div>
        `;
    }
};
