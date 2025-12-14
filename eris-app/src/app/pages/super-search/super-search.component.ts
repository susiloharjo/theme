import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';
import { SearchService } from './search.service';
import { SearchResult, SearchFacets, SearchFilters, DateRangeOption } from './search.types';

@Component({
    selector: 'app-super-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './super-search.component.html'
})
export class SuperSearchComponent implements OnInit, OnDestroy {
    // Search state
    searchQuery: string = '';
    results: SearchResult[] = [];
    facets: SearchFacets = { objectType: [], status: [] };
    totalCount: number = 0;
    currentPage: number = 1;
    pageSize: number = 20;
    isLoading: boolean = false;

    // Math helper for template
    Math = Math;

    // Filters
    selectedObjectTypes: string[] = [];
    selectedStatuses: string[] = [];
    selectedDateRange: string = '';

    // Date range options
    dateRangeOptions: DateRangeOption[] = [
        { value: '7days', label: 'Last 7 Days' },
        { value: '14days', label: 'Last 2 Weeks' },
        { value: '30days', label: 'This Month' },
        { value: '90days', label: 'This Quarter' },
        { value: '1year', label: 'This Year' },
        { value: '3years', label: 'Last 3 Years' }
    ];

    // UI state
    showMoreStatuses: boolean = false;
    expandedResult: string | null = null;

    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    private searchSubscription?: Subscription;

    constructor(
        private searchService: SearchService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Check for query param - only search if query provided
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            if (params['q']) {
                this.searchQuery = params['q'];
                this.performSearch();
            } else {
                // Load initial data (all items)
                this.performSearch();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Removed: onSearchInput() - no longer using debounced auto-search

    onSearchSubmit(): void {
        this.currentPage = 1;
        this.performSearch();
        // Update URL
        this.router.navigate([], {
            queryParams: { q: this.searchQuery || null },
            queryParamsHandling: 'merge'
        });
    }

    performSearch(): void {
        // Cancel previous request to prevent race conditions
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }

        this.isLoading = true;
        console.log('Starting search for:', this.searchQuery);

        const filters: SearchFilters = {};
        if (this.selectedObjectTypes.length > 0) {
            filters.objectType = this.selectedObjectTypes;
        }
        if (this.selectedStatuses.length > 0) {
            filters.status = this.selectedStatuses;
        }
        if (this.selectedDateRange) {
            filters.dateRange = this.selectedDateRange as any;
        }

        this.searchSubscription = this.searchService.search({
            query: this.searchQuery,
            filters,
            page: this.currentPage,
            size: this.pageSize
        }).pipe(
            finalize(() => {
                this.isLoading = false;
                console.log('Search completed, isLoading set to false');
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response) => {
                console.log('Search response received:', response.totalCount, 'results');
                this.results = response.results;
                this.facets = response.facets;
                this.totalCount = response.totalCount;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Search error:', err);
                this.results = [];
                this.facets = { objectType: [], status: [] };
                this.totalCount = 0;
                this.cdr.detectChanges();
            }
        });
    }

    // Facet toggle methods
    toggleObjectType(type: string): void {
        const idx = this.selectedObjectTypes.indexOf(type);
        if (idx >= 0) {
            this.selectedObjectTypes.splice(idx, 1);
        } else {
            this.selectedObjectTypes.push(type);
        }
        this.currentPage = 1;
        this.performSearch();
    }

    toggleStatus(status: string): void {
        const idx = this.selectedStatuses.indexOf(status);
        if (idx >= 0) {
            this.selectedStatuses.splice(idx, 1);
        } else {
            this.selectedStatuses.push(status);
        }
        this.currentPage = 1;
        this.performSearch();
    }

    selectDateRange(range: string): void {
        this.selectedDateRange = this.selectedDateRange === range ? '' : range;
        this.currentPage = 1;
        this.performSearch();
    }

    clearAllFilters(): void {
        this.selectedObjectTypes = [];
        this.selectedStatuses = [];
        this.selectedDateRange = '';
        this.currentPage = 1;
        this.performSearch();
    }

    isObjectTypeSelected(type: string): boolean {
        return this.selectedObjectTypes.includes(type);
    }

    isStatusSelected(status: string): boolean {
        return this.selectedStatuses.includes(status);
    }

    // Pagination
    onPageChange(page: number): void {
        this.currentPage = page;
        this.performSearch();
    }

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    get visibleStatuses() {
        // Null-safe: prevent race condition when facets not yet loaded
        const statuses = this.facets?.status ?? [];
        if (this.showMoreStatuses || statuses.length <= 5) {
            return statuses;
        }
        return statuses.slice(0, 5);
    }

    // Result actions
    toggleResultExpand(resultId: string): void {
        this.expandedResult = this.expandedResult === resultId ? null : resultId;
    }

    navigateToResult(result: SearchResult): void {
        // Navigate based on object type
        switch (result.objectType) {
            case 'CRM':
                if (result.objectId.startsWith('c')) {
                    this.router.navigate(['/crm/customers', result.objectId]);
                } else if (result.objectId.startsWith('o')) {
                    this.router.navigate(['/crm/opportunities']);
                } else if (result.objectId.startsWith('l')) {
                    this.router.navigate(['/crm/leads']);
                }
                break;
            case 'PMO':
                this.router.navigate(['/pmo/projects']);
                break;
            case 'Training':
                this.router.navigate(['/training/list']);
                break;
            case 'Purchase':
                this.router.navigate(['/purchase/list']);
                break;
        }
    }

    // Helper methods
    getObjectTypeIcon(type: string): string {
        switch (type) {
            case 'CRM': return 'users';
            case 'PMO': return 'folder';
            case 'Training': return 'book-open';
            case 'Purchase': return 'shopping-cart';
            default: return 'file';
        }
    }

    getObjectTypeColor(type: string): string {
        switch (type) {
            case 'CRM': return 'bg-blue-500';
            case 'PMO': return 'bg-purple-500';
            case 'Training': return 'bg-green-500';
            case 'Purchase': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    }

    getStatusColor(status: string): string {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus.includes('active') || lowerStatus.includes('approved') || lowerStatus.includes('completed') || lowerStatus.includes('won')) {
            return 'bg-green-100 text-green-800';
        }
        if (lowerStatus.includes('pending') || lowerStatus.includes('new') || lowerStatus.includes('planning')) {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (lowerStatus.includes('closed') || lowerStatus.includes('lost') || lowerStatus.includes('rejected')) {
            return 'bg-red-100 text-red-800';
        }
        if (lowerStatus.includes('progress') || lowerStatus.includes('negotiation') || lowerStatus.includes('proposal')) {
            return 'bg-blue-100 text-blue-800';
        }
        return 'bg-gray-100 text-gray-800';
    }

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatAmount(amount: number | undefined, currency: string | undefined): string {
        if (amount === undefined || amount === null) return '';
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            maximumFractionDigits: 0
        }).format(amount);
        return currency ? `${formatted} ${currency}` : formatted;
    }
}
