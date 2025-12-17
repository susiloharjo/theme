import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    User, Customer, Lead, Opportunity,
    Industry, LeadSource, OpportunityStage,
    DashboardKPIs, FunnelStep, RevenueForecastPoint,
    PaymentTerm, CustomerStatus, LeadStatus,
    ContactMethod
} from './crm.types';

@Injectable({
    providedIn: 'root'
})
export class CrmDataService {
    private apiUrl = 'http://localhost:3006/api/crm';

    constructor(private http: HttpClient) { }

    // --- USERS (Mock) ---
    private users: User[] = [
        { id: 'u1', name: 'John Sales', email: 'john@eris.com', role: 'sales', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
        { id: 'u2', name: 'Jane Manager', email: 'jane@eris.com', role: 'manager', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
        { id: 'u3', name: 'Bob CS', email: 'bob@eris.com', role: 'cs', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u3' }
    ];

    getUsers(): Observable<User[]> {
        return of(this.users);
    }

    getUserById(id: string): Observable<User | undefined> {
        return of(this.users.find(u => u.id === id));
    }

    // --- CUSTOMERS (API) ---
    getCustomers(): Observable<Customer[]> {
        return this.http.get<{ data: any[] }>(`${this.apiUrl}/customers`).pipe(
            map(response => response.data.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                industryId: 'i1', // Mock mapping
                industryName: c.industry, // Directly from API
                taxId: 'TAX-' + c.code,
                address: '123 Business Rd',
                city: 'Jakarta',
                country: 'Indonesia',
                paymentTerms: 'NET30' as PaymentTerm,
                status: (c.status as CustomerStatus) || 'active',
                ownerUserId: 'u1', // Default
                ownerName: c.ownerName,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                revenueYtd: c.revenue
            })))
        );
    }

    getCustomerById(id: string): Observable<Customer | undefined> {
        return this.getCustomers().pipe(
            map(customers => customers.find(c => c.id === id))
        );
    }

    // --- OPPORTUNITIES (API) ---
    getOpportunities(): Observable<Opportunity[]> {
        // We need customers to map 'account' (name) to customerId if possible, or just leave it loosely coupled
        // For now, we'll map the 'account' field from API to 'customerName' UI helper
        return this.http.get<{ data: any[] }>(`${this.apiUrl}/opportunities`).pipe(
            map(response => response.data.map(o => ({
                id: o.id,
                name: o.name,
                customerId: 'unknown', // We don't have ID in DB, only name
                customerName: o.account, // Map 'account' to customerName
                stageId: o.stage === 'Proposal' ? 's2' : (o.stage === 'Negotiation' ? 's3' : 's1'), // Simple mapping
                stageName: o.stage,
                expectedValue: o.amount,
                probability: 50, // Default
                expectedCloseDate: o.closeDate,
                ownerUserId: 'u1',
                createdAt: o.createdAt,
                updatedAt: o.updatedAt
            })))
        );
    }

    getOpportunitiesByCustomerId(customerId: string): Observable<Opportunity[]> {
        // Complex logic: Fetch customer to get name, then fetch opps and filter by name
        return this.getCustomerById(customerId).pipe(
            switchMap(customer => {
                if (!customer) return of([]);
                return this.getOpportunities().pipe(
                    map(opps => opps.filter(o => o.customerName === customer.name))
                );
            })
        );
    }

    // --- LEADS (Mock) ---
    private leads: Lead[] = [
        {
            id: 'l1', companyName: 'Acme Corp', contactName: 'Alice Smith',
            contactEmail: 'contact@acme.com', contactPhone: '+1 555-0101',
            leadSourceId: 'src1', status: 'New', leadScore: 50,
            interestNotes: 'Interested in ERP',
            ownerUserId: 'u1', createdAt: '2023-11-01', updatedAt: '2023-11-01'
        },
        {
            id: 'l2', companyName: 'Globex', contactName: 'John Doe',
            contactEmail: 'john.doe@email.com', contactPhone: '+1 555-0102',
            leadSourceId: 'src3', status: 'Contacted', leadScore: 75,
            interestNotes: 'Follow up needed',
            ownerUserId: 'u2', createdAt: '2023-11-05', updatedAt: '2023-11-06'
        }
    ];

    getLeads(): Observable<Lead[]> {
        return of(this.leads);
    }

    // --- HELPERS (Mock) ---
    getIndustries(): Observable<Industry[]> {
        return of([
            { id: 'i1', name: 'Technology' },
            { id: 'i2', name: 'Manufacturing' },
            { id: 'i3', name: 'Retail' }
        ]);
    }

    getOpportunityStages(): Observable<OpportunityStage[]> {
        return of([
            { id: 's1', name: 'Qualification', sortOrder: 1 },
            { id: 's2', name: 'Proposal', sortOrder: 2 },
            { id: 's3', name: 'Negotiation', sortOrder: 3 },
            { id: 's4', name: 'Closed Won', sortOrder: 4 },
            { id: 's5', name: 'Closed Lost', sortOrder: 5 }
        ]);
    }

    getLeadSources(): Observable<LeadSource[]> {
        return of([
            { id: 'src1', name: 'Website' },
            { id: 'src2', name: 'Referral' },
            { id: 'src3', name: 'LinkedIn' }
        ]);
    }

    getContactsByCustomerId(customerId: string): Observable<any[]> {
        return of([]);
    }

    getQuotationsByCustomerId(customerId: string): Observable<any[]> {
        return of([]);
    }

    getActivitiesByCustomerId(customerId: string): Observable<any[]> {
        return of([]);
    }

    // --- DASHBOARD (Mock) ---
    getDashboardKPIs(): Observable<DashboardKPIs> {
        return of({
            totalPipelineValue: 5000000,
            forecastThisMonth: 1200000,
            newLeadsThisMonth: 15,
            winRate: 35
        });
    }

    getPipelineFunnel(): Observable<FunnelStep[]> {
        return of([
            { name: 'Qualification', count: 10, value: 1000000 },
            { name: 'Proposal', count: 5, value: 2000000 },
            { name: 'Negotiation', count: 2, value: 500000 }
        ]);
    }

    getRevenueForecast(): Observable<RevenueForecastPoint[]> {
        return of([
            { month: 'Jan', revenue: 500000 },
            { month: 'Feb', revenue: 750000 },
            { month: 'Mar', revenue: 600000 }
        ]);
    }

    getTopOpportunities(limit: number): Observable<Opportunity[]> {
        return this.getOpportunities().pipe(
            map(opps => opps.sort((a, b) => b.expectedValue - a.expectedValue).slice(0, limit))
        );
    }

    getTopCustomers(limit: number): Observable<Customer[]> {
        return this.getCustomers().pipe(
            map(customers => customers.slice(0, limit)) // Mock sorting
        );
    }
}
