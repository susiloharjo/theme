// Component Utilities for SAP HANA Theme
// Handles interactive behaviors for components

// Sidebar Toggle
export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (!sidebar || !sidebarToggle) return;

    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('hidden');
        }
    };

    sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
}

// Modal Management
export function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalCloses = document.querySelectorAll('[data-modal-close]');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const modal = overlay.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            });
        }
    });
}

// Toast Notifications
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-down`;

    const colors = {
        info: 'bg-primary-50 border-primary-200 text-primary-800',
        success: 'bg-success-50 border-success-200 text-success-800',
        warning: 'bg-warning-50 border-warning-200 text-warning-800',
        error: 'bg-error-50 border-error-200 text-error-800',
    };

    toast.className = `flex items-center gap-3 p-4 mb-3 rounded-md border shadow-lg ${colors[type]} animate-slide-down`;
    toast.innerHTML = `
    <span class="flex-1">${message}</span>
    <button class="text-current opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 w-80';
    document.body.appendChild(container);
    return container;
}

// Dropdown Menus
export function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownId = trigger.getAttribute('data-dropdown-trigger');
            const dropdown = document.getElementById(dropdownId);

            // Close other dropdowns
            document.querySelectorAll('[data-dropdown]').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });

            if (dropdown) {
                dropdown.classList.toggle('hidden');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('[data-dropdown]').forEach(d => {
            d.classList.add('hidden');
        });
    });
}

// Tab Navigation
export function initTabs() {
    const tabButtons = document.querySelectorAll('[data-tab-target]');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-tab-target');
            const tabGroup = button.closest('[data-tab-group]');

            if (!tabGroup) return;

            // Remove active class from all tabs in group
            tabGroup.querySelectorAll('[data-tab-target]').forEach(btn => {
                btn.classList.remove('border-primary', 'text-primary');
                btn.classList.add('border-transparent', 'text-text-secondary');
            });

            // Add active class to clicked tab
            button.classList.remove('border-transparent', 'text-text-secondary');
            button.classList.add('border-primary', 'text-primary');

            // Hide all tab panels in group
            tabGroup.querySelectorAll('[data-tab-panel]').forEach(panel => {
                panel.classList.add('hidden');
            });

            // Show target panel
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
            }
        });
    });
}

// Table Sorting
export function initTableSort() {
    const sortableHeaders = document.querySelectorAll('[data-sort]');

    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const table = header.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(header.parentElement.children).indexOf(header);
            const currentOrder = header.getAttribute('data-sort-order') || 'asc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

            // Remove sort indicators from all headers
            sortableHeaders.forEach(h => {
                h.setAttribute('data-sort-order', '');
                h.querySelector('.sort-indicator')?.remove();
            });

            // Add sort indicator
            header.setAttribute('data-sort-order', newOrder);
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator ml-1';
            indicator.innerHTML = newOrder === 'asc' ? '↑' : '↓';
            header.appendChild(indicator);

            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.children[columnIndex].textContent.trim();
                const bValue = b.children[columnIndex].textContent.trim();

                const aNum = parseFloat(aValue);
                const bNum = parseFloat(bValue);

                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return newOrder === 'asc' ? aNum - bNum : bNum - aNum;
                }

                return newOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            });

            // Re-append sorted rows
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

// Drawer/Offcanvas
export function initDrawers() {
    const drawerTriggers = document.querySelectorAll('[data-drawer-target]');
    const drawerCloses = document.querySelectorAll('[data-drawer-close]');

    drawerTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const drawerId = trigger.getAttribute('data-drawer-target');
            const drawer = document.getElementById(drawerId);
            if (drawer) {
                drawer.classList.remove('translate-x-full');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    drawerCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const drawer = closeBtn.closest('[data-drawer]');
            if (drawer) {
                drawer.classList.add('translate-x-full');
                document.body.style.overflow = '';
            }
        });
    });
}

// Initialize all components
export function initComponents() {
    initSidebar();
    initModals();
    initDropdowns();
    initTabs();
    initTableSort();
    initDrawers();
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }
}
