export type UserRole = 'admin' | 'sales' | 'cs' | 'manager';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string; // For UI
    isActive: boolean;
}

export type CustomerStatus = 'prospect' | 'active' | 'dormant' | 'blocked';
export type PaymentTerm = 'NET30' | 'NET60' | 'COD' | 'Immediate';

export interface Industry {
    id: string;
    name: string;
}

export interface Customer {
    id: string;
    code: string;
    name: string;
    industryId: string;
    taxId: string;
    address: string;
    city: string;
    country: string;
    website?: string;
    paymentTerms: PaymentTerm;
    status: CustomerStatus;
    ownerUserId: string;
    createdAt: string;
    updatedAt: string;

    // UI Helpers
    industryName?: string; // Populated by service
    ownerName?: string;    // Populated by service
    lastActivityDate?: string; // Populated by service
    revenueYtd?: number;   // Populated by service
}

export type ContactMethod = 'whatsapp' | 'email' | 'phone';

export interface CustomerContact {
    id: string;
    customerId: string;
    name: string;
    position: string;
    phone: string;
    email: string;
    preferredContactMethod: ContactMethod;
    isPrimary: boolean;
}

export interface LeadSource {
    id: string;
    name: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';

export interface Lead {
    id: string;
    customerId?: string; // If linked to existing
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    leadSourceId: string;
    interestNotes: string;
    leadScore: number;
    status: LeadStatus;
    ownerUserId: string;
    createdAt: string;
    updatedAt: string;

    // UI Helpers
    sourceName?: string;
    ownerName?: string;
}

export interface OpportunityStage {
    id: string;
    name: string;
    sortOrder: number;
}

export interface Opportunity {
    id: string;
    customerId: string;
    leadId?: string;
    name: string;
    description?: string;
    stageId: string;
    expectedValue: number;
    probability: number; // 0-100
    expectedCloseDate: string;
    competitor?: string;
    ownerUserId: string;
    createdAt: string;
    updatedAt: string;

    // UI Helpers
    stageName?: string;
    customerName?: string;
    ownerName?: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    defaultPrice: number;
    isActive: boolean;
}

export interface OpportunityItem {
    id: string;
    opportunityId: string;
    productId?: string;
    itemName: string; // If custom or copied from product
    qty: number;
    unitPrice: number;
    discountPercent: number;
    notes?: string;
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'visit' | 'demo';

export interface Activity {
    id: string;
    customerId?: string;
    leadId?: string;
    opportunityId?: string;
    ticketId?: string;
    type: ActivityType;
    subject: string;
    notes: string;
    activityDate: string;
    nextFollowUpDate?: string;
    assignedToUserId: string;
    createdByUserId: string;
    createdAt: string;

    // UI Helpers
    assigneeName?: string;
    creatorName?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled';

export interface Quotation {
    id: string;
    quotationNo: string;
    customerId: string;
    opportunityId?: string;
    status: QuotationStatus;
    validUntil: string;
    termsAndConditions: string;
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
    createdByUserId: string;
    approvedByUserId?: string;
    createdAt: string;
    updatedAt: string;

    // UI Helpers
    customerName?: string;
    creatorName?: string;
}

export interface QuotationItem {
    id: string;
    quotationId: string;
    productId?: string;
    itemName: string;
    qty: number;
    unitPrice: number;
    discountPercent: number;
    taxPercent: number;
    lineTotal: number;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
    id: string;
    ticketNo: string;
    customerId: string;
    contactId?: string;
    subject: string;
    description: string;
    category: string;
    status: TicketStatus;
    priority: TicketPriority;
    openedAt: string;
    closedAt?: string;
    assignedToUserId?: string;
    createdByUserId: string;

    assigneeName?: string;
    // customerName already defined above
}

// --- DASHBOARD TYPES ---

export interface DashboardKPIs {
    totalPipelineValue: number;
    forecastThisMonth: number;
    newLeadsThisMonth: number;
    winRate: number; // Percentage
}

export interface FunnelStep {
    name: string;
    count: number;
    value: number;
}

export interface RevenueForecastPoint {
    month: string; // "Jan", "Feb" etc
    revenue: number;
}

export interface ActivityHeatmapPoint {
    day: string; // Mon, Tue...
    hour: number; // 0-23
    count: number;
}
