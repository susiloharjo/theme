import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CrmDataService } from '../shared/crm-data.service';
import { Customer } from '../shared/crm.types';
import { SearchService } from '../../../services/search.service';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './customer-list.html',
})
export class CustomerListComponent implements OnInit {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;
    searchTerm = '';

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'name', label: 'Customer Name', visible: true },
        { key: 'code', label: 'Code', visible: true },
        { key: 'industry', label: 'Industry', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'ownerName', label: 'Owner', visible: true },
        { key: 'lastActivity', label: 'Last Activity', visible: true },
        { key: 'revenue', label: 'Revenue (YTD)', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    customers: Customer[] = [];
    filteredCustomers: Customer[] = [];
    isSearching = false;

    constructor(
        private crmService: CrmDataService,
        private searchService: SearchService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.crmService.getCustomers().subscribe(data => {
            this.customers = data;
            this.filteredCustomers = data;
            this.cdr.detectChanges();
        });
    }

    onSearch() {
        if (!this.searchTerm.trim()) {
            this.filteredCustomers = this.customers;
            return;
        }

        this.isSearching = true;
        this.searchService.search(this.searchTerm, { objectType: 'CRM' }).subscribe({
            next: (response) => {
                const resultIds = new Set(response.results.map(r => r.objectId));
                this.filteredCustomers = this.customers.filter(c => resultIds.has(c.id));
                this.currentPage = 1;
                this.isSearching = false;
            },
            error: (err) => {
                console.error('Search failed', err);
                this.isSearching = false;
            }
        });
    }

    // Pagination Properties
    currentPage = 1;
    pageSize = 10;

    get paginatedCustomers() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredCustomers.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredCustomers.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize - 1, this.filteredCustomers.length);
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
