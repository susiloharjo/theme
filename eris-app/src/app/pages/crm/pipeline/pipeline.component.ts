import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmDataService } from '../shared/crm-data.service';
import { Opportunity, OpportunityStage, User, Customer } from '../shared/crm.types';

@Component({
    selector: 'app-pipeline',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pipeline.html',
})
export class PipelineComponent implements OnInit {
    stages: OpportunityStage[] = [];
    opportunities: Opportunity[] = [];
    filteredOpportunities: Opportunity[] = [];

    // Data Sources for Filters
    owners: User[] = [];
    customers: Customer[] = [];

    // Filter State
    filterOwnerId: string = 'all';
    filterCustomerId: string = 'all';
    filterValueMin: number = 0;
    filterProbMin: number = 0;
    filterStageIds: string[] = []; // Not actually used in multi-select yet as UI is complex, will stick to basic logic first or simple array
    filterShowActive: boolean = false;
    showStageDropdown: boolean = false; // For custom dropdown toggle
    searchQuery: string = '';

    // For drag and drop
    draggedOpportunity: Opportunity | null = null;

    // Side Panel
    selectedOpportunity: Opportunity | null = null;
    activeTab: 'details' | 'items' | 'activities' = 'details';

    // View Mode
    viewMode: 'kanban' | 'table' = 'kanban';

    // Load More Logic
    stageLimits: { [stageId: string]: number } = {};
    readonly DEFAULT_LIMIT = 5;
    readonly PAGE_SIZE = 5;

    constructor(private crmService: CrmDataService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Load stages (Sync)
        this.stages = this.crmService.getOpportunityStages();
        this.filterStageIds = this.stages.map(s => s.id);
        this.stages.forEach(stage => {
            this.stageLimits[stage.id] = this.DEFAULT_LIMIT;
        });

        // Load opportunities (Async)
        this.loadOpportunities();

        // Load auxiliary data
        this.owners = this.crmService.getUsers().filter(u => u.role === 'sales' || u.role === 'manager');
        this.crmService.getCustomers().subscribe(data => this.customers = data);
    }

    loadOpportunities() {
        this.crmService.getOpportunities().subscribe(data => {
            this.opportunities = data;
            this.applyFilters();
        });
    }

    applyFilters() {
        this.filteredOpportunities = this.opportunities.filter(opp => {
            // Search Filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const matchesName = opp.name.toLowerCase().includes(query);
                const matchesCustomer = (opp.customerName || '').toLowerCase().includes(query);
                if (!matchesName && !matchesCustomer) return false;
            }

            // Owner Filter
            if (this.filterOwnerId !== 'all' && opp.ownerUserId !== this.filterOwnerId) return false;

            // Customer Filter
            if (this.filterCustomerId !== 'all' && opp.customerId !== this.filterCustomerId) return false;

            // Value Filter
            if (this.filterValueMin > 0 && opp.expectedValue < this.filterValueMin) return false;

            // Probability Filter
            if (this.filterProbMin > 0 && opp.probability < this.filterProbMin) return false;

            // Stage Filter
            if (this.filterStageIds.length > 0 && !this.filterStageIds.includes(opp.stageId)) return false;

            // Active / Inactive Filter (using stage ID or status field if available, for now assuming Active means open stages)
            if (this.filterShowActive) {
                // Assuming 's4' is Closed Won and 's5' is Closed Lost based on mock data conventions
                if (opp.stageId === 's4' || opp.stageId === 's5') return false;
            }

            return true;
        });
    }

    toggleStageFilter(stageId: string) {
        if (this.filterStageIds.includes(stageId)) {
            this.filterStageIds = this.filterStageIds.filter(id => id !== stageId);
        } else {
            this.filterStageIds.push(stageId);
        }
        this.applyFilters();
    }

    isStageSelected(stageId: string): boolean {
        return this.filterStageIds.includes(stageId);
    }

    getOpportunitiesByStage(stageId: string): Opportunity[] {
        // Return ALL filtered opportunities (for totals)
        return this.filteredOpportunities.filter(o => o.stageId === stageId);
    }

    getVisibleOpportunities(stageId: string): Opportunity[] {
        // Return only the visible subset for the column view
        const stageOps = this.getOpportunitiesByStage(stageId);
        const limit = this.stageLimits[stageId] || this.DEFAULT_LIMIT;
        return stageOps.slice(0, limit);
    }

    loadMore(stageId: string) {
        if (!this.stageLimits[stageId]) {
            this.stageLimits[stageId] = this.DEFAULT_LIMIT;
        }
        this.stageLimits[stageId] += this.PAGE_SIZE;
    }

    hasMore(stageId: string): boolean {
        const total = this.getOpportunitiesByStage(stageId).length;
        const currentLimit = this.stageLimits[stageId] || this.DEFAULT_LIMIT;
        return currentLimit < total;
    }

    getStageTotal(stageId: string): number {
        return this.getOpportunitiesByStage(stageId).reduce((sum, opp) => sum + opp.expectedValue, 0);
    }

    // Drag and Drop Handlers
    onDragStart(event: DragEvent, opportunity: Opportunity) {
        this.draggedOpportunity = opportunity;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', opportunity.id);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    }

    onDrop(event: DragEvent, newStageId: string) {
        event.preventDefault();
        if (this.draggedOpportunity && this.draggedOpportunity.stageId !== newStageId) {
            // Update local state directly for instant feedback
            this.draggedOpportunity.stageId = newStageId;

            // Re-apply filters to ensure data consistency
            this.applyFilters();

            // In a real app, we would call an API here:
            // this.crmService.updateOpportunityStage(this.draggedOpportunity.id, newStageId).subscribe();

            this.draggedOpportunity = null;
        }
    }

    selectOpportunity(opp: Opportunity) {
        this.selectedOpportunity = opp;
        this.activeTab = 'details'; // Reset to default
    }

    closeDrawer() {
        this.selectedOpportunity = null;
    }

    setActiveTab(tab: 'details' | 'items' | 'activities') {
        this.activeTab = tab;
    }

    setViewMode(mode: 'kanban' | 'table') {
        this.viewMode = mode;
    }

    // --- Card Helper Methods ---

    isHighValue(opp: Opportunity): boolean {
        return opp.expectedValue > 100000000; // > 100 Million
    }

    isStale(opp: Opportunity): boolean {
        // Mock staleness check: if last updated > 20 days ago
        // For demo purposes, let's say "stale" if created more than 30 days ago and not updated recently
        // Since we have mock data with fixed dates, we'll simulate this logic or check 'updatedAt'
        const updated = new Date(opp.updatedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - updated.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 20;
    }

    isRisk(opp: Opportunity): boolean {
        // Risk if High Value but Low Probability
        return this.isHighValue(opp) && opp.probability < 30;
    }

    getProgressBarColor(probability: number): string {
        if (probability < 30) return 'bg-red-500';
        if (probability < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    }
}
