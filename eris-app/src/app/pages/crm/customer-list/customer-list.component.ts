import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrmDataService } from '../shared/crm-data.service';
import { Customer } from '../shared/crm.types';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './customer-list.html',
})
export class CustomerListComponent implements OnInit {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;

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

    constructor(private crmService: CrmDataService) { }

    ngOnInit() {
        this.crmService.getCustomers().subscribe(data => {
            this.customers = data;
        });
    }

    // Pagination Properties
    currentPage = 1;
    pageSize = 10;

    get paginatedCustomers() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.customers.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.customers.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize - 1, this.customers.length);
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
