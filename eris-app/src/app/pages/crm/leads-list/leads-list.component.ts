import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrmDataService } from '../shared/crm-data.service';
import { Lead } from '../shared/crm.types';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-leads-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './leads-list.html',
})
export class LeadsListComponent implements OnInit {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;

    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'companyName', label: 'Company / Contact', visible: true },
        { key: 'sourceName', label: 'Lead Source', visible: true },
        { key: 'leadScore', label: 'Lead Score', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'ownerName', label: 'Owner', visible: true },
        { key: 'createdAt', label: 'Created Date', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    leads: Lead[] = [];

    constructor(private crmService: CrmDataService) { }

    ngOnInit() {
        this.crmService.getLeads().subscribe(data => {
            this.leads = data;
        });
    }

    // Pagination Properties
    currentPage = 1;
    pageSize = 10;

    get paginatedLeads() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.leads.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.leads.length / this.pageSize);
    }

    get startIndex(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.startIndex + this.pageSize - 1, this.leads.length);
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
