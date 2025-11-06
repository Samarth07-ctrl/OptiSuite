// frontend/js/ui.js

export const UI = {
    formatCurrency(amount) {
        const number = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(number);
    },

    showLoading() {
        return '<div class="flex justify-center items-center p-12"><div class="spinner"></div></div>';
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
        const toastHTML = `
            <div id="${toastId}" class="toast ${colors[type]} flex items-center gap-3 text-white shadow-lg rounded-lg px-4 py-3">
                <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
                <span>${message}</span>
            </div>
        `;
        const container = document.getElementById('toastContainer');
        if (container) {
            container.insertAdjacentHTML('beforeend', toastHTML);
            // Use window.lucide
            if (typeof window.lucide !== 'undefined') {
                window.lucide.createIcons();
            }
            setTimeout(() => {
                document.getElementById(toastId)?.remove();
            }, 4000);
        } else {
            console.error("Toast container not found!");
        }
    },

    showModal(title, content, size = 'md') {
        const sizeClasses = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-xl',
            xl: 'max-w-3xl'
        };
        const modalHTML = `
            <div class="modal-backdrop fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onclick="this.remove()">
                <div class="glass-card w-full ${sizeClasses[size]}" onclick="event.stopPropagation()">
                    <div class="p-4 sm:p-6 border-b border-[hsl(var(--c-border))] flex justify-between items-center">
                        <h3 class="text-lg font-semibold">${title}</h3>
                        <button onclick="this.closest('.modal-backdrop').remove()" class="p-1 rounded-full text-[hsl(var(--c-text-subtle))] hover:bg-[hsla(var(--c-primary),0.1)] transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">${content}</div>
                </div>
            </div>`;
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            requestAnimationFrame(() => {
                document.querySelector('.modal-backdrop')?.classList.add('show');
            });
            // Use window.lucide
            if (typeof window.lucide !== 'undefined') {
                window.lucide.createIcons();
            }
        } else {
             console.error("Modal container not found!");
        }
    },

    createForm(fields, submitText, onSubmit) {
        const formFields = fields.map(field => {
            const requiredAttr = field.required ? 'required' : '';
            const label = `<label class="block text-sm font-medium text-[hsl(var(--c-text-subtle))] mb-1">${field.label}</label>`;
            switch (field.type) {
                case 'divider': 
                    return `<div class="col-span-1 sm:col-span-2 pt-4 mt-4 border-t border-[hsl(var(--c-border))]"><h4 class="text-xs font-semibold uppercase text-[hsl(var(--c-text-subtle))]">${field.label}</h4></div>`;
                case 'select':
                    const options = field.options.map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`).join('');
                    return `<div class="form-field">${label}<select name="${field.name}" ${requiredAttr}>${options}</select></div>`;
                case 'textarea':
                    return `<div class="form-field sm:col-span-2">${label}<textarea name="${field.name}" ${requiredAttr} rows="3">${field.value || ''}</textarea></div>`;
                default:
                    return `<div class="form-field">${label}<input type="${field.type}" name="${field.name}" value="${field.value || ''}" ${requiredAttr} step="${field.step || ''}"></div>`;
            }
        }).join('');
        return `
            <form class="space-y-0" onsubmit="${onSubmit}"> 
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4"> 
                    ${formFields}
                </div>
                <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-[hsl(var(--c-border))]">
                    <button type="button" onclick="this.closest('.modal-backdrop').remove()" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">${submitText}</button>
                </div>
            </form>`;
    },
};