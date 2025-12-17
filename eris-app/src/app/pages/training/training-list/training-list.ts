import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../training.service';
import { Training } from '../training.types';
import { SearchService } from '../../../services/search.service';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-training-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './training-list.html',
})
export class TrainingListComponent implements OnInit {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;
    searchText = '';
    searchResults: Set<string> | null = null;

    sortColumn: string | null = 'startDate';
    sortDirection: 'asc' | 'desc' = 'asc';

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'topic', label: 'Topic / Course Name', visible: true },
        { key: 'provider', label: 'Provider', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'startDate', label: 'Start Date', visible: true },
        { key: 'endDate', label: 'End Date', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'cost', label: 'Cost', visible: true },
        { key: 'location', label: 'Location', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    trainings: Training[] = [];

    constructor(
        private trainingService: TrainingService,
        private searchService: SearchService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.trainingService.getTrainings().subscribe({
            next: (data) => {
                this.trainings = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load trainings', err)
        });
    }

    onSearch() {
        if (!this.searchText.trim()) {
            this.searchResults = null;
            return;
        }

        this.searchService.search(this.searchText, { objectType: 'Training' }).subscribe({
            next: (response) => {
                this.searchResults = new Set(response.results.map(r => r.objectId));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Search failed', err);
                this.searchResults = null;
                this.cdr.detectChanges();
            }
        });
    }

    get filteredSortedTrainings(): Training[] {
        let result = [...this.trainings];

        // Filter: Search Logic
        if (this.searchResults) {
            result = result.filter(t => this.searchResults!.has(t.id));
        } else if (this.searchText) {
            // Fallback local search
            const lowerSearch = this.searchText.toLowerCase();
            result = result.filter(item =>
                item.topic.toLowerCase().includes(lowerSearch) ||
                item.provider.toLowerCase().includes(lowerSearch) ||
                item.type.toLowerCase().includes(lowerSearch) ||
                item.location.toLowerCase().includes(lowerSearch)
            );
        }

        // Sort
        if (this.sortColumn) {
            result.sort((a, b) => {
                let valA = (a as any)[this.sortColumn!]?.toString().toLowerCase() || '';
                let valB = (b as any)[this.sortColumn!]?.toString().toLowerCase() || '';

                if (this.sortColumn === 'cost') {
                    // Handle numeric cost or 'free'
                    const numA = valA === 'free' ? 0 : parseInt(valA.replace(/,/g, ''), 10) || 0;
                    const numB = valB === 'free' ? 0 : parseInt(valB.replace(/,/g, ''), 10) || 0;
                    return this.sortDirection === 'asc' ? numA - numB : numB - numA;
                }

                if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }

    // Pagination Properties
    currentPage = 1;
    pageSize = 10;

    get paginatedTrainings(): Training[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredSortedTrainings.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSortedTrainings.length / this.pageSize) || 1;
    }

    get startIndex(): number {
        if (this.filteredSortedTrainings.length === 0) return 0;
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        if (this.filteredSortedTrainings.length === 0) return 0;
        return Math.min(this.startIndex + this.pageSize - 1, this.filteredSortedTrainings.length);
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
