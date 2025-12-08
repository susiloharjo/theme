import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import {
    User, Customer, CustomerContact, Lead, Opportunity,
    Product, Activity, Quotation, Ticket, Industry, LeadSource, OpportunityStage,
    DashboardKPIs, FunnelStep, RevenueForecastPoint
} from './crm.types';

@Injectable({
    providedIn: 'root'
})
export class CrmDataService {

    // --- MOCK DATA STORE ---

    private users: User[] = [
        { id: 'u1', name: 'John Sales', email: 'john@eris.com', role: 'sales', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
        { id: 'u2', name: 'Jane Manager', email: 'jane@eris.com', role: 'manager', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
        { id: 'u3', name: 'Bob CS', email: 'bob@eris.com', role: 'cs', isActive: true, avatarUrl: 'https://i.pravatar.cc/150?u=u3' }
    ];

    private industries: Industry[] = [
        { id: 'i1', name: 'Technology' },
        { id: 'i2', name: 'Manufacturing' },
        { id: 'i3', name: 'Retail' },
        { id: 'i4', name: 'Government' },
        { id: 'i5', name: 'Healthcare' }
    ];

    private opportunityStages: OpportunityStage[] = [
        { id: 'st_leads', name: 'Leads', sortOrder: 1 },
        { id: 'st_opps', name: 'Opportunities', sortOrder: 2 },
        { id: 's1', name: 'Qualification', sortOrder: 3 },
        { id: 's2', name: 'Proposal', sortOrder: 4 },
        { id: 's3', name: 'Negotiation', sortOrder: 5 },
        { id: 's4', name: 'Closed Won', sortOrder: 6 },
        { id: 's5', name: 'Closed Lost', sortOrder: 7 }
    ];

    private leadSources: LeadSource[] = [
        { id: 'src1', name: 'Website' },
        { id: 'src2', name: 'Referral' },
        { id: 'src3', name: 'LinkedIn' },
        { id: 'src4', name: 'Cold Call' },
        { id: 'src5', name: 'Event' }
    ];

    private customers: Customer[] = [
        {
            id: 'c1', code: 'CUST-001', name: 'TechSolutions Inc.', industryId: 'i1',
            taxId: '12.345.678.9-012.000', address: '123 Tech Park, Jakarta', city: 'Jakarta', country: 'Indonesia',
            paymentTerms: 'NET30', status: 'active', ownerUserId: 'u1',
            createdAt: '2023-01-01', updatedAt: '2023-01-01'
        },
        {
            id: 'c2', code: 'CUST-002', name: 'Global Corp', industryId: 'i2',
            taxId: '98.765.432.1-000.000', address: '456 Industrial Ave, Surabaya', city: 'Surabaya', country: 'Indonesia',
            paymentTerms: 'NET60', status: 'active', ownerUserId: 'u2',
            createdAt: '2023-02-15', updatedAt: '2023-02-15'
        },
        {
            id: 'c3', code: 'CUST-003', name: 'Retail Giant Ltd', industryId: 'i3',
            taxId: '11.222.333.4-555.666', address: '789 Mall Road, Bandung', city: 'Bandung', country: 'Indonesia',
            paymentTerms: 'COD', status: 'prospect', ownerUserId: 'u1',
            createdAt: '2023-11-20', updatedAt: '2023-11-20'
        }
    ];

    private contacts: CustomerContact[] = [
        { id: 'cc1', customerId: 'c1', name: 'Alice CTO', position: 'CTO', phone: '+628123456789', email: 'alice@techsolutions.com', preferredContactMethod: 'email', isPrimary: true },
        { id: 'cc2', customerId: 'c1', name: 'Bob Procurement', position: 'Purchasing Mgr', phone: '+628111222333', email: 'bob@techsolutions.com', preferredContactMethod: 'whatsapp', isPrimary: false },
        { id: 'cc3', customerId: 'c2', name: 'Charlie CEO', position: 'CEO', phone: '+628999888777', email: 'charlie@globalcorp.com', preferredContactMethod: 'email', isPrimary: true }
    ];

    private leads: Lead[] = [
        {
            id: 'l1', companyName: 'Future Tech Ltd', contactName: 'David Lee', contactEmail: 'david@futuretech.com', contactPhone: '+628111000111',
            leadSourceId: 'src1', interestNotes: 'Interested in ERP module', leadScore: 85, status: 'Qualified',
            ownerUserId: 'u1', createdAt: '2023-11-25', updatedAt: '2023-11-25'
        },
        {
            id: 'l2', companyName: 'Mega Industries', contactName: 'Eva Green', contactEmail: 'eva@megaind.com', contactPhone: '+628111000222',
            leadSourceId: 'src3', interestNotes: 'Looking for HR solution', leadScore: 45, status: 'New',
            ownerUserId: 'u2', createdAt: '2023-11-28', updatedAt: '2023-11-28'
        },
        {
            id: 'l3', companyName: 'Small Biz Inc', contactName: 'Fred Brown', contactEmail: 'fred@smallbiz.com', contactPhone: '+628111000333',
            leadSourceId: 'src2', interestNotes: 'Referral from existing client', leadScore: 70, status: 'Contacted',
            ownerUserId: 'u1', createdAt: '2023-11-29', updatedAt: '2023-11-29'
        },
        {
            id: 'l4', companyName: 'Creative Agency', contactName: 'Gina White', contactEmail: 'gina@creative.com', contactPhone: '+628111000444',
            leadSourceId: 'src5', interestNotes: 'Met at Tech Expo', leadScore: 30, status: 'New',
            ownerUserId: 'u3', createdAt: '2023-12-01', updatedAt: '2023-12-01'
        },
        {
            id: 'l5', companyName: 'Logistics Pro', contactName: 'Harry Black', contactEmail: 'harry@logistics.com', contactPhone: '+628111000555',
            leadSourceId: 'src4', interestNotes: 'Direct inquiry', leadScore: 60, status: 'Contacted',
            ownerUserId: 'u2', createdAt: '2023-12-02', updatedAt: '2023-12-02'
        },
        {
            id: 'l6', companyName: 'Marketing 101', contactName: 'Ivy Blue', contactEmail: 'ivy@marketing.com', contactPhone: '+628111000666',
            leadSourceId: 'src1', interestNotes: 'Website form', leadScore: 90, status: 'Qualified',
            ownerUserId: 'u1', createdAt: '2023-12-03', updatedAt: '2023-12-03'
        }
    ];

    private opportunities: Opportunity[] = [
        {
            id: 'o1', customerId: 'c1', name: 'Q4 Software License Expansion', stageId: 's2',
            description: 'Expansion of software licenses for the engineering team to support new hires.',
            expectedValue: 50000000, probability: 60, expectedCloseDate: '2023-12-31',
            ownerUserId: 'u1', createdAt: '2023-11-01', updatedAt: '2023-11-01'
        },
        {
            id: 'o2', customerId: 'c2', name: 'Factory Automation Project', stageId: 's3',
            expectedValue: 250000000, probability: 80, expectedCloseDate: '2024-01-15',
            ownerUserId: 'u2', createdAt: '2023-10-15', updatedAt: '2023-10-20'
        },
        {
            id: 'o3', customerId: 'c3', name: 'New Retail POS System', stageId: 's1',
            expectedValue: 75000000, probability: 20, expectedCloseDate: '2024-02-01',
            ownerUserId: 'u1', createdAt: '2023-12-01', updatedAt: '2023-12-01'
        },
        {
            id: 'o4', customerId: 'c2', name: 'Warehouse IoT Upgrade', stageId: 's2',
            expectedValue: 120000000, probability: 40, expectedCloseDate: '2024-03-10',
            ownerUserId: 'u2', createdAt: '2023-12-05', updatedAt: '2023-12-05'
        },
        {
            id: 'o5', customerId: 'c1', name: 'Annual Maintenance Contract', stageId: 's4',
            expectedValue: 25000000, probability: 100, expectedCloseDate: '2023-12-01',
            ownerUserId: 'u1', createdAt: '2023-11-10', updatedAt: '2023-11-20'
        },
        {
            id: 'o6', customerId: 'c3', name: 'CRM Consultation', stageId: 's5',
            expectedValue: 10000000, probability: 0, expectedCloseDate: '2023-11-30',
            ownerUserId: 'u3', createdAt: '2023-11-05', updatedAt: '2023-11-30'
        },
        // --- NEW MOCK DATA (10 Items) ---
        {
            id: 'o7', customerId: 'c2', name: 'Logistics Fleet Upgrade', stageId: 'st_leads',
            expectedValue: 0, probability: 10, expectedCloseDate: '2024-04-01',
            ownerUserId: 'u2', createdAt: '2023-12-08', updatedAt: '2023-12-08'
        },
        {
            id: 'o8', customerId: 'c3', name: 'Retail Chain Expansion', stageId: 'st_leads',
            expectedValue: 0, probability: 5, expectedCloseDate: '2024-05-15',
            ownerUserId: 'u1', createdAt: '2023-12-08', updatedAt: '2023-12-08'
        },
        {
            id: 'o9', customerId: 'c1', name: 'Q1 Hardware Refresh', stageId: 'st_opps',
            expectedValue: 150000000, probability: 20, expectedCloseDate: '2024-02-28',
            ownerUserId: 'u1', createdAt: '2023-12-07', updatedAt: '2023-12-07'
        },
        {
            id: 'o10', customerId: 'c2', name: 'Cloud Migration Phase 1', stageId: 'st_opps',
            expectedValue: 500000000, probability: 25, expectedCloseDate: '2024-06-30',
            ownerUserId: 'u2', createdAt: '2023-12-06', updatedAt: '2023-12-06'
        },
        {
            id: 'o11', customerId: 'c1', name: 'HR ERP Customization', stageId: 's1',
            expectedValue: 80000000, probability: 40, expectedCloseDate: '2024-03-01',
            ownerUserId: 'u3', createdAt: '2023-11-25', updatedAt: '2023-12-05'
        },
        {
            id: 'o12', customerId: 'c2', name: 'Security Audit & Compliance', stageId: 's1',
            expectedValue: 45000000, probability: 35, expectedCloseDate: '2024-01-30',
            ownerUserId: 'u2', createdAt: '2023-11-20', updatedAt: '2023-11-20'
        },
        {
            id: 'o13', customerId: 'c3', name: 'Managed Services Contract', stageId: 's2',
            expectedValue: 120000000, probability: 60, expectedCloseDate: '2024-02-15',
            ownerUserId: 'u1', createdAt: '2023-11-15', updatedAt: '2023-12-01'
        },
        {
            id: 'o14', customerId: 'c1', name: 'Global License Agreement', stageId: 's3',
            expectedValue: 1200000000, probability: 90, expectedCloseDate: '2023-12-25',
            ownerUserId: 'u1', createdAt: '2023-09-01', updatedAt: '2023-12-08'
        },
        {
            id: 'o15', customerId: 'c2', name: 'Consulting Hour Block', stageId: 's4',
            expectedValue: 50000000, probability: 100, expectedCloseDate: '2023-11-30',
            ownerUserId: 'u2', createdAt: '2023-11-10', updatedAt: '2023-11-25'
        },
        {
            id: 'o16', customerId: 'c3', name: 'Legacy System Support', stageId: 's5',
            expectedValue: 30000000, probability: 0, expectedCloseDate: '2023-11-15',
            ownerUserId: 'u3', createdAt: '2023-10-01', updatedAt: '2023-11-15'
        }
    ];

    private activities: Activity[] = [
        // Email activities
        {
            id: 'a1', customerId: 'c1', opportunityId: 'o1', type: 'email',
            subject: 'Proposal for Q4 License Expansion',
            notes: 'Hi Team, I wanted to check on the status of our proposal for the Q4 license expansion. Please let me know if you need any additional information.',
            sender: 'Alice CTO <alice@techsolutions.com>',
            preview: 'Hi Team, I wanted to check on the status of our proposal for the Q4 license expansion...',
            isRead: true,
            activityDate: '2023-11-07T14:30:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-07T14:30:00'
        },
        {
            id: 'a2', customerId: 'c1', type: 'email',
            subject: 'Re: Proposal for Q4 License Expansion',
            notes: 'Thank you for your interest. We have reviewed your requirements and will send the updated proposal by end of day.',
            sender: 'John Sales <john@eris.com>',
            preview: 'Thank you for your interest. We have reviewed your requirements and will send the updated...',
            isRead: false,
            activityDate: '2023-11-07T16:45:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-07T16:45:00'
        },
        {
            id: 'a3', customerId: 'c1', type: 'email',
            subject: 'Meeting Invitation: Demo Session',
            notes: 'Dear Alice, Would you be available for a product demo next Tuesday at 10 AM? Looking forward to showing you our latest features.',
            sender: 'John Sales <john@eris.com>',
            preview: 'Dear Alice, Would you be available for a product demo next Tuesday at 10 AM?...',
            isRead: true,
            activityDate: '2023-11-05T09:15:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-05T09:15:00'
        },
        {
            id: 'a4', customerId: 'c1', type: 'email',
            subject: 'Contract Terms Discussion',
            notes: 'Hi John, We would like to discuss the payment terms mentioned in the proposal. Can we schedule a call this week?',
            sender: 'Alice CTO <alice@techsolutions.com>',
            preview: 'Hi John, We would like to discuss the payment terms mentioned in the proposal...',
            isRead: false,
            activityDate: '2023-11-08T11:20:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-08T11:20:00'
        },

        // WhatsApp activities
        {
            id: 'a5', customerId: 'c1', type: 'whatsapp',
            subject: 'Quick question about pricing',
            notes: 'Can you send me the detailed pricing breakdown for the additional licenses?',
            messageText: 'Can you send me the detailed pricing breakdown for the additional licenses?',
            direction: 'received',
            activityDate: '2023-11-06T10:30:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-06T10:30:00'
        },
        {
            id: 'a6', customerId: 'c1', type: 'whatsapp',
            subject: 'Pricing breakdown sent',
            notes: 'Sure! I just sent you the detailed breakdown via email. Let me know if you have any questions.',
            messageText: 'Sure! I just sent you the detailed breakdown via email. Let me know if you have any questions.',
            direction: 'sent',
            activityDate: '2023-11-06T10:35:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-06T10:35:00'
        },
        {
            id: 'a7', customerId: 'c1', type: 'whatsapp',
            subject: 'Thank you',
            notes: 'Thanks John! The pricing looks good. We will discuss internally and get back to you.',
            messageText: 'Thanks John! The pricing looks good. We will discuss internally and get back to you.',
            direction: 'received',
            activityDate: '2023-11-06T10:38:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-06T10:38:00'
        },
        {
            id: 'a8', customerId: 'c1', type: 'whatsapp',
            subject: 'Follow up',
            notes: 'Perfect! Feel free to reach out if you need anything else. Happy to help! 😊',
            messageText: 'Perfect! Feel free to reach out if you need anything else. Happy to help! 😊',
            direction: 'sent',
            activityDate: '2023-11-06T10:40:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-06T10:40:00'
        },
        {
            id: 'a9', customerId: 'c1', type: 'whatsapp',
            subject: 'Meeting confirmation',
            notes: 'Hi John, confirming our meeting for tomorrow at 2 PM. See you then!',
            messageText: 'Hi John, confirming our meeting for tomorrow at 2 PM. See you then!',
            direction: 'received',
            activityDate: '2023-11-08T15:20:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-08T15:20:00'
        },
        {
            id: 'a10', customerId: 'c1', type: 'whatsapp',
            subject: 'Confirmed',
            notes: 'Great! Looking forward to it. I will send you the meeting link shortly.',
            messageText: 'Great! Looking forward to it. I will send you the meeting link shortly.',
            direction: 'sent',
            activityDate: '2023-11-08T15:22:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-08T15:22:00'
        },

        // Other activity types
        {
            id: 'a11', customerId: 'c1', opportunityId: 'o1', type: 'call',
            subject: 'Discuss License Requirements',
            notes: 'Client needs 50 more seats. Discussed budget and timeline.',
            activityDate: '2023-11-05T10:00:00',
            assignedToUserId: 'u1',
            createdByUserId: 'u1',
            createdAt: '2023-11-05T10:00:00'
        }
    ];

    private quotations: Quotation[] = [
        {
            id: 'q1', quotationNo: 'QUO-23-001', customerId: 'c1', opportunityId: 'o1',
            status: 'sent', validUntil: '2023-12-01', termsAndConditions: 'Standard Terms',
            subtotal: 50000000, discountTotal: 0, taxTotal: 5500000, grandTotal: 55500000,
            createdByUserId: 'u1', createdAt: '2023-11-07', updatedAt: '2023-11-07'
        }
    ];


    // --- STATE MANAGEMENT ---

    // We can use BehaviorSubjects if we want reactive updates, 
    // but for this mock service we can just return filtered arrays to keep it simple first.

    constructor() { }

    // --- USERS ---
    getUsers(): User[] { return this.users; }
    getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }

    // --- CUSTOMERS ---
    getCustomers(): Observable<Customer[]> {
        // Enrich data
        const enriched = this.customers.map(c => ({
            ...c,
            industryName: this.industries.find(i => i.id === c.industryId)?.name,
            ownerName: this.users.find(u => u.id === c.ownerUserId)?.name,
            lastActivityDate: '2023-12-01T10:00:00', // Mock
            revenueYtd: Math.floor(Math.random() * 1000000000) // Mock random revenue
        }));
        return of(enriched);
    }

    getCustomerById(id: string): Observable<Customer | undefined> {
        const c = this.customers.find(x => x.id === id);
        if (!c) return of(undefined);

        const enriched = {
            ...c,
            industryName: this.industries.find(i => i.id === c.industryId)?.name,
            ownerName: this.users.find(u => u.id === c.ownerUserId)?.name
        };
        return of(enriched);
    }

    // --- CONTACTS ---
    getContactsByCustomerId(customerId: string): Observable<CustomerContact[]> {
        return of(this.contacts.filter(c => c.customerId === customerId));
    }

    // --- LEADS ---
    getLeads(): Observable<Lead[]> {
        const enriched = this.leads.map(l => ({
            ...l,
            sourceName: this.leadSources.find(s => s.id === l.leadSourceId)?.name,
            ownerName: this.users.find(u => u.id === l.ownerUserId)?.name
        }));
        return of(enriched);
    }

    getLeadSources(): LeadSource[] { return this.leadSources; }

    // --- OPPORTUNITIES ---
    getOpportunitiesByCustomerId(customerId: string): Observable<Opportunity[]> {
        const opps = this.opportunities.filter(o => o.customerId === customerId).map(o => ({
            ...o,
            stageName: this.opportunityStages.find(s => s.id === o.stageId)?.name,
            ownerName: this.users.find(u => u.id === o.ownerUserId)?.name
        }));
        return of(opps);
    }

    getOpportunities(): Observable<Opportunity[]> {
        const opps = this.opportunities.map(o => {
            const contact = this.contacts.find(c => c.customerId === o.customerId && c.isPrimary) || this.contacts.find(c => c.customerId === o.customerId);
            return {
                ...o,
                stageName: this.opportunityStages.find(s => s.id === o.stageId)?.name,
                customerName: this.customers.find(c => c.id === o.customerId)?.name,
                ownerName: this.users.find(u => u.id === o.ownerUserId)?.name,
                contactName: contact?.name,
                contactEmail: contact?.email,
                contactPhone: contact?.phone
            };
        });
        return of(opps);
    }

    getOpportunityStages(): OpportunityStage[] { return this.opportunityStages; }

    // --- ACTIVITIES ---
    getActivitiesByCustomerId(customerId: string): Observable<Activity[]> {
        const acts = this.activities
            .filter(a => a.customerId === customerId)
            .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()) // Newest first
            .map(a => ({
                ...a,
                assigneeName: this.users.find(u => u.id === a.assignedToUserId)?.name,
                creatorName: this.users.find(u => u.id === a.createdByUserId)?.name
            }));
        return of(acts);
    }

    // --- QUOTATIONS ---
    getQuotationsByCustomerId(customerId: string): Observable<Quotation[]> {
        return of(this.quotations.filter(q => q.customerId === customerId));
    }

    // --- DASHBOARD AGGREGATION ---
    getDashboardKPIs(): Observable<DashboardKPIs> {
        // Calculate Pipeline Value (Sum of all open opps)
        const totalPipeline = this.opportunities
            .filter(o => o.stageId !== 's4' && o.stageId !== 's5')
            .reduce((sum, o) => sum + o.expectedValue, 0);

        // Forecast This Month (Opps expected to close this month * probability)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const forecast = this.opportunities
            .filter(o => {
                const closeDate = new Date(o.expectedCloseDate);
                return closeDate >= startOfMonth && closeDate <= endOfMonth && o.stageId !== 's5';
            })
            .reduce((sum, o) => sum + (o.expectedValue * (o.probability / 100)), 0);

        // New Leads This Month
        const newLeads = this.leads.filter(l => {
            const created = new Date(l.createdAt);
            return created >= startOfMonth && created <= endOfMonth;
        }).length;

        // Win Rate (Won / (Won + Lost))
        const won = this.opportunities.filter(o => o.stageId === 's4').length;
        const lost = this.opportunities.filter(o => o.stageId === 's5').length;
        const totalClosed = won + lost;
        const winRate = totalClosed > 0 ? (won / totalClosed) * 100 : 0;

        return of({
            totalPipelineValue: totalPipeline,
            forecastThisMonth: forecast,
            newLeadsThisMonth: newLeads,
            winRate: Math.round(winRate)
        });
    }

    getPipelineFunnel(): Observable<FunnelStep[]> {
        // Simple count per stage
        const funnel = this.opportunityStages.map(stage => {
            const count = this.opportunities.filter(o => o.stageId === stage.id).length;
            const value = this.opportunities.filter(o => o.stageId === stage.id).reduce((sum, o) => sum + o.expectedValue, 0);
            return { name: stage.name, count, value };
        });
        return of(funnel);
    }

    getRevenueForecast(): Observable<RevenueForecastPoint[]> {
        // Mock 6 months forecast
        return of([
            { month: 'Jan', revenue: 150000000 },
            { month: 'Feb', revenue: 200000000 },
            { month: 'Mar', revenue: 180000000 },
            { month: 'Apr', revenue: 250000000 },
            { month: 'May', revenue: 300000000 },
            { month: 'Jun', revenue: 280000000 }
        ]);
    }

    getTopOpportunities(limit: number = 5): Observable<Opportunity[]> {
        const top = [...this.opportunities]
            .sort((a, b) => b.expectedValue - a.expectedValue)
            .slice(0, limit)
            .map(o => ({
                ...o,
                customerName: this.customers.find(c => c.id === o.customerId)?.name,
                ownerName: this.users.find(u => u.id === o.ownerUserId)?.name,
                stageName: this.opportunityStages.find(s => s.id === o.stageId)?.name
            }));
        return of(top);
    }

    getTopCustomers(limit: number = 5): Observable<Customer[]> {
        // Enriched with mock RevenueYTD
        const top = [...this.customers]
            .map(c => ({
                ...c,
                industryName: this.industries.find(i => i.id === c.industryId)?.name,
                revenueYtd: Math.floor(Math.random() * 500000000) + 100000000 // Mock
            }))
            .sort((a, b) => (b.revenueYtd || 0) - (a.revenueYtd || 0))
            .slice(0, limit);
        return of(top);
    }
}
