import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-opportunities-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './opportunities-list.html',
})
export class OpportunitiesListComponent {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'name', label: 'Opportunity Name', visible: true },
        { key: 'account', label: 'Account', visible: true },
        { key: 'stage', label: 'Stage', visible: true },
        { key: 'amount', label: 'Amount', visible: true },
        { key: 'closeDate', label: 'Close Date', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    opportunities = [
        { name: 'Q4 Software License', account: 'TechSolutions Inc.', stage: 'Proposal', amount: '$45,000', closeDate: '2023-12-15' },
        { name: 'Consulting Project', account: 'Global Corp', stage: 'Negotiation', amount: '$120,000', closeDate: '2023-11-30' },
        { name: 'Cloud Migration', account: 'StartUp Hub', stage: 'Qualification', amount: '$25,000', closeDate: '2024-01-20' },
        { name: 'System Integration', account: 'Enterprise Systems', stage: 'Closed Won', amount: '$85,000', closeDate: '2023-10-15' },
        { name: 'Support Contract', account: 'Cloud Services Ltd', stage: 'Proposal', amount: '$15,000', closeDate: '2023-12-01' },
        // More dummy data
        { name: 'Data Analytics Upgrade', account: 'Alpha Inc', stage: 'Qualification', amount: '$30,000', closeDate: '2024-02-10' },
        { name: 'Security Audit', account: 'Beta Corp', stage: 'Closed Won', amount: '$50,000', closeDate: '2023-09-01' },
        { name: 'Mobile App Dev', account: 'Gamma Ltd', stage: 'Negotiation', amount: '$90,000', closeDate: '2024-03-15' },
        { name: 'ERP Implementation', account: 'Delta LLC', stage: 'Proposal', amount: '$200,000', closeDate: '2024-06-01' },
        { name: 'Training Program', account: 'Epsilon SA', stage: 'Qualification', amount: '$10,000', closeDate: '2024-01-05' },
        { name: 'Website Redesign', account: 'Zeta Gmbh', stage: 'Closed Won', amount: '$15,000', closeDate: '2023-11-10' },
        { name: 'IT Infrastructure', account: 'Eta Pvt', stage: 'Negotiation', amount: '$60,000', closeDate: '2024-04-20' }
    ];

    // Pagination Properties
    currentPage = 1;
    pageSize = 10;

    get paginatedOpportunities() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.opportunities.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.opportunities.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize - 1, this.opportunities.length);
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
