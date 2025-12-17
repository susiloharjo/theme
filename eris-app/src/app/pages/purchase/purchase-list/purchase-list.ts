import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseService, PurchaseRequest, TrackingStep } from '../purchase.service';

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
export class PurchaseListComponent implements OnInit {

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

    constructor(
        private purchaseService: PurchaseService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.purchaseService.getPurchases().subscribe({
            next: (data) => {
                this.requests = data;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load purchases', err);
            }
        });
    }

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
