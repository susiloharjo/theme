import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TrackingStep {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed' | 'rejected' | 'revision';
    date?: string;
    details?: string[]; // e.g., "PO Number: 123", "Approver: John"
}

interface PurchaseRequest {
    id: string;
    title: string;
    requester: string;
    department: string;
    requestDate: string;
    totalAmount: number;
    status: string; // "Completed", "In Progress", "Rejected"
    currentStepIndex: number; // 0-7
    steps: TrackingStep[];
}

interface ColumnConfig {
    key: keyof PurchaseRequest | 'select' | 'actions';
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-purchase-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './purchase-list.html',
})
export class PurchaseListComponent {

    // The 8 Process Steps Definition
    readonly STEPS_TEMPLATE = [
        { title: 'Request Creation', desc: 'Draft & Submission' },
        { title: 'Line Manager Approval', desc: 'Operational Validation' },
        { title: 'Procurement Review', desc: 'Vendor & Specs Check' },
        { title: 'Cost Approval', desc: 'Finance/Management' },
        { title: 'PO Issuance', desc: 'Vendor Confirmation' },
        { title: 'Delivery & Receiving', desc: 'QC & Goods Receipt' },
        { title: 'Invoice Verification', desc: '3-Way Matching' },
        { title: 'Payment Processing', desc: 'Transfer & Closing' }
    ];

    requests: PurchaseRequest[] = [];
    selectedRequest: PurchaseRequest | null = null;
    isSettingsOpen = false;
    isDrawerOpen = false;

    // Search & Sort State
    searchText = '';
    sortColumn: string | null = null;
    sortDirection: 'asc' | 'desc' = 'asc';

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'id', label: 'PR Number', visible: true },
        { key: 'title', label: 'Title', visible: true },
        { key: 'requestDate', label: 'Request Date', visible: true },
        { key: 'requester', label: 'Requester', visible: true },
        { key: 'department', label: 'Department', visible: true },
        { key: 'totalAmount', label: 'Amount', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'actions', label: 'Action', visible: true }
    ];

    // Pagination
    currentPage = 1;
    pageSize = 10;

    get filteredSortedRequests(): PurchaseRequest[] {
        let result = [...this.requests];

        // Filter
        if (this.searchText) {
            const lowerSearch = this.searchText.toLowerCase();
            result = result.filter(item =>
                item.id.toLowerCase().includes(lowerSearch) ||
                item.title.toLowerCase().includes(lowerSearch) ||
                item.requester.toLowerCase().includes(lowerSearch) ||
                item.department.toLowerCase().includes(lowerSearch) ||
                item.status.toLowerCase().includes(lowerSearch)
            );
        }

        // Sort
        if (this.sortColumn) {
            result.sort((a, b) => {
                let valA = (a as any)[this.sortColumn!] ?? '';
                let valB = (b as any)[this.sortColumn!] ?? '';

                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }

    get paginatedRequests(): PurchaseRequest[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredSortedRequests.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSortedRequests.length / this.pageSize) || 1;
    }

    get startIndex(): number {
        if (this.filteredSortedRequests.length === 0) return 0;
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        if (this.filteredSortedRequests.length === 0) return 0;
        return Math.min(this.startIndex + this.pageSize - 1, this.filteredSortedRequests.length);
    }

    onSort(column: string) {
        if (column === 'select' || column === 'actions') return;

        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    constructor() {
        this.initMockData();
    }

    initMockData() {
        // Helper to generate steps for a PR
        const generateSteps = (currentStepIdx: number, status: string): TrackingStep[] => {
            return this.STEPS_TEMPLATE.map((step, index) => {
                let stepStatus: 'pending' | 'active' | 'completed' | 'rejected' | 'revision' = 'pending';
                let date = '';
                let details: string[] = [];

                if (index < currentStepIdx) {
                    stepStatus = 'completed';
                    date = '2025-12-0' + (index + 1); // Fake dates
                } else if (index === currentStepIdx) {
                    stepStatus = status === 'Rejected' ? 'rejected' : 'active';
                    date = '2025-12-0' + (index + 1);
                }

                // Add fake details based on step
                if (stepStatus !== 'pending') {
                    switch (index) {
                        case 0: details = ['Submitted by Requester', 'Docs Attached: 2']; break;
                        case 1: details = index === currentStepIdx && status === 'Rejected' ? ['Rejected: Budget Exceeded'] : ['Approved by Manager']; break;
                        case 2: details = ['Vendor Selected: PT Indocomp', 'Price Comparison Done']; break;
                        case 3: details = ['Capex Budget Checked', 'GM Approved']; break;
                        case 4: details = ['PO-2025-001 Created', 'Sent to Vendor']; break;
                        case 5: details = ['GRN-8821 Received', 'QC Passed: 10/10']; break;
                        case 6: details = ['Invoice INV/2025/99 Verified', 'Matched with PO']; break;
                        case 7: details = ['Payment Scheduled: 30 Days', 'Transfer ID: TRX-999']; break;
                    }
                }

                return {
                    id: index + 1,
                    title: step.title,
                    description: step.desc,
                    status: stepStatus,
                    date: date,
                    details: details
                };
            });
        };

        this.requests = [
            {
                id: 'PR-2025-001',
                title: 'Data Center Upgrade',
                requester: 'John Doe',
                department: 'IT',
                requestDate: '2025-12-01',
                totalAmount: 125000000,
                status: 'Completed',
                currentStepIndex: 7,
                steps: generateSteps(8, 'Completed')
            },
            {
                id: 'PR-2025-002',
                title: 'Recruitment Agency Fees',
                requester: 'Jane Smith',
                department: 'HR',
                requestDate: '2025-12-05',
                totalAmount: 15000000,
                status: 'In Progress',
                currentStepIndex: 4,
                steps: generateSteps(4, 'In Progress')
            },
            {
                id: 'PR-2025-003',
                title: 'Forklift Maintenance',
                requester: 'Robert Brown',
                department: 'Operations',
                requestDate: '2025-12-06',
                totalAmount: 4500000,
                status: 'Rejected',
                currentStepIndex: 1,
                steps: generateSteps(1, 'Rejected')
            },
            {
                id: 'PR-2025-004',
                title: 'Q4 Marketing Campaign',
                requester: 'Alice Johnson',
                department: 'Marketing',
                requestDate: '2025-12-07',
                totalAmount: 8500000,
                status: 'In Progress',
                currentStepIndex: 0,
                steps: generateSteps(0, 'In Progress')
            },
            {
                id: 'PR-2025-005',
                title: 'Office Furniture',
                requester: 'Michael Chen',
                department: 'Finance',
                requestDate: '2025-11-28',
                totalAmount: 45000000,
                status: 'Completed',
                currentStepIndex: 7,
                steps: generateSteps(8, 'Completed')
            },
            {
                id: 'PR-2025-006',
                title: 'CRM License Renewal',
                requester: 'Sarah Williams',
                department: 'Sales',
                requestDate: '2025-12-02',
                totalAmount: 22000000,
                status: 'In Progress',
                currentStepIndex: 6,
                steps: generateSteps(6, 'In Progress')
            },
            {
                id: 'PR-2025-007',
                title: 'Development Laptops',
                requester: 'David Lee',
                department: 'IT',
                requestDate: '2025-12-03',
                totalAmount: 3200000,
                status: 'In Progress',
                currentStepIndex: 2,
                steps: generateSteps(2, 'In Progress')
            },
            {
                id: 'PR-2025-008',
                title: 'Warehouse Racking System',
                requester: 'Emma Davis',
                department: 'Operations',
                requestDate: '2025-11-25',
                totalAmount: 67000000,
                status: 'Completed',
                currentStepIndex: 7,
                steps: generateSteps(8, 'Completed')
            },
            {
                id: 'PR-2025-009',
                title: 'Event Booth Construction',
                requester: 'James Wilson',
                department: 'Marketing',
                requestDate: '2025-12-04',
                totalAmount: 12500000,
                status: 'In Progress',
                currentStepIndex: 3,
                steps: generateSteps(3, 'In Progress')
            },
            {
                id: 'PR-2025-010',
                title: 'Employee Training Program',
                requester: 'Olivia Martinez',
                department: 'HR',
                requestDate: '2025-12-06',
                totalAmount: 5800000,
                status: 'Rejected',
                currentStepIndex: 3,
                steps: generateSteps(3, 'Rejected')
            },
            {
                id: 'PR-2025-011',
                title: 'Annual Audit Services',
                requester: 'William Taylor',
                department: 'Finance',
                requestDate: '2025-11-30',
                totalAmount: 89000000,
                status: 'Completed',
                currentStepIndex: 7,
                steps: generateSteps(8, 'Completed')
            },
            {
                id: 'PR-2025-012',
                title: 'Sales Team Tablets',
                requester: 'Sophia Anderson',
                department: 'Sales',
                requestDate: '2025-12-05',
                totalAmount: 18000000,
                status: 'In Progress',
                currentStepIndex: 5,
                steps: generateSteps(5, 'In Progress')
            },
            {
                id: 'PR-2025-013',
                title: 'Cloud Server Expansion',
                requester: 'Benjamin Thomas',
                department: 'IT',
                requestDate: '2025-12-07',
                totalAmount: 9500000,
                status: 'In Progress',
                currentStepIndex: 1,
                steps: generateSteps(1, 'In Progress')
            },
            {
                id: 'PR-2025-014',
                title: 'Fleet Maintenance',
                requester: 'Isabella Garcia',
                department: 'Operations',
                requestDate: '2025-11-29',
                totalAmount: 34000000,
                status: 'Completed',
                currentStepIndex: 7,
                steps: generateSteps(8, 'Completed')
            },
            {
                id: 'PR-2025-015',
                title: 'Social Media Ads',
                requester: 'Lucas Rodriguez',
                department: 'Marketing',
                requestDate: '2025-12-06',
                totalAmount: 7200000,
                status: 'In Progress',
                currentStepIndex: 4,
                steps: generateSteps(4, 'In Progress')
            }
        ];
    }

    openTracker(request: PurchaseRequest) {
        this.selectedRequest = request;
        this.isDrawerOpen = true;
    }

    closeTracker() {
        this.isDrawerOpen = false;
        this.selectedRequest = null;
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    closeSettings() {
        this.isSettingsOpen = false;
    }

    toggleColumn(colKey: string) {
        const col = this.columns.find(c => c.key === colKey);
        if (col) {
            col.visible = !col.visible;
        }
    }
}
