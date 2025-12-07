import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmDataService } from '../shared/crm-data.service';
import { Opportunity, OpportunityStage } from '../shared/crm.types';

@Component({
    selector: 'app-pipeline',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pipeline.html',
})
export class PipelineComponent implements OnInit {
    stages: OpportunityStage[] = [];
    opportunities: Opportunity[] = [];

    // For drag and drop
    draggedOpportunity: Opportunity | null = null;

    // Side Panel
    selectedOpportunity: Opportunity | null = null;
    activeTab: 'details' | 'items' | 'activities' = 'details';

    // View Mode
    viewMode: 'kanban' | 'table' = 'kanban';

    constructor(private crmService: CrmDataService) { }

    ngOnInit() {
        this.stages = this.crmService.getOpportunityStages();
        this.loadOpportunities();
    }

    loadOpportunities() {
        this.crmService.getOpportunities().subscribe(data => {
            this.opportunities = data;
        });
    }

    getOpportunitiesByStage(stageId: string): Opportunity[] {
        return this.opportunities.filter(o => o.stageId === stageId);
    }

    getStageTotal(stageId: string): number {
        return this.opportunities
            .filter(o => o.stageId === stageId)
            .reduce((sum, o) => sum + o.expectedValue, 0);
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
}
