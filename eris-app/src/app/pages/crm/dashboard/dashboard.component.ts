import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmDataService } from '../shared/crm-data.service';
import { DashboardKPIs, FunnelStep, RevenueForecastPoint, Opportunity, Customer } from '../shared/crm.types';

@Component({
    selector: 'app-crm-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
})
export class CrmDashboardComponent implements OnInit {
    kpis: DashboardKPIs | null = null;
    funnelData: FunnelStep[] = [];
    revenueData: RevenueForecastPoint[] = [];
    topOpportunities: Opportunity[] = [];
    topCustomers: Customer[] = [];

    constructor(private crmService: CrmDataService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.crmService.getDashboardKPIs().subscribe(data => this.kpis = data);
        this.crmService.getPipelineFunnel().subscribe(data => this.funnelData = data);
        this.crmService.getRevenueForecast().subscribe(data => this.revenueData = data);
        this.crmService.getTopOpportunities(5).subscribe(data => this.topOpportunities = data);
        this.crmService.getTopCustomers(5).subscribe(data => this.topCustomers = data);
    }

    // Helper for max value in funnel to calculate bar widths
    getMaxFunnelValue(): number {
        return Math.max(...this.funnelData.map(s => s.count), 1);
    }
}
