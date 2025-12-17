import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmDataService } from '../shared/crm-data.service';
import { Opportunity } from '../shared/crm.types';
import { SearchService } from '../../../services/search.service';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-opportunities-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './opportunities-list.html',
})
export class OpportunitiesListComponent implements OnInit {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;
    searchTerm = '';

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'name', label: 'Opportunity Name', visible: true },
        { key: 'customerName', label: 'Account', visible: true },
        { key: 'stageName', label: 'Stage', visible: true },
        { key: 'expectedValue', label: 'Amount', visible: true },
        { key: 'expectedCloseDate', label: 'Close Date', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    opportunities: Opportunity[] = [];
    filteredOpportunities: Opportunity[] = [];
    isSearching = false;

    constructor(
        private crmService: CrmDataService,
        private searchService: SearchService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.crmService.getOpportunities().subscribe(data => {
            this.opportunities = data;
            this.filteredOpportunities = data;
            this.cdr.detectChanges();
        });
    }

    onSearch() {
        if (!this.searchTerm.trim()) {
            this.filteredOpportunities = this.opportunities;
            return;
        }

        this.isSearching = true;
        this.searchService.search(this.searchTerm, { objectType: 'CRM' }).subscribe({
            next: (response) => {
                const resultIds = new Set(response.results.map(r => r.objectId));
                // Filter opportunities that match the search result IDs
                // Note: Search index for opportunities might have different objectId if we are searching across multiple types.
                // Assuming objectType 'CRM' returns both Customers and Opportunities.
                // We should filter only those present in our opportunities list.
                this.filteredOpportunities = this.opportunities.filter(o => resultIds.has(o.id));
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

    get paginatedOpportunities() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredOpportunities.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredOpportunities.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize - 1, this.filteredOpportunities.length);
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
