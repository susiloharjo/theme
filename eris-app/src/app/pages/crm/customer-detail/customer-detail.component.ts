import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CrmDataService } from '../shared/crm-data.service';
import { Customer, CustomerContact, Activity, Opportunity, Quotation } from '../shared/crm.types';

@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './customer-detail.html',
})
export class CustomerDetailComponent implements OnInit {
    customer: Customer | undefined;
    contacts: CustomerContact[] = [];
    activities: Activity[] = [];
    opportunities: Opportunity[] = [];
    quotations: Quotation[] = [];

    activeTab: 'overview' | 'contacts' | 'activities' | 'opportunities' | 'quotations' | 'documents' = 'overview';

    constructor(
        private route: ActivatedRoute,
        private crmService: CrmDataService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadCustomerData(id);
            }
        });
    }

    loadCustomerData(id: string) {
        this.crmService.getCustomerById(id).subscribe(c => this.customer = c);
        this.crmService.getContactsByCustomerId(id).subscribe(data => this.contacts = data);
        this.crmService.getActivitiesByCustomerId(id).subscribe(data => this.activities = data);
        this.crmService.getOpportunitiesByCustomerId(id).subscribe(data => this.opportunities = data);
        // Quotations fetch in future
    }
}
