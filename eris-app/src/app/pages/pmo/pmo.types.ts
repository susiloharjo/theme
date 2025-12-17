export interface TeamMember {
    name: string;
    role: string;
    avatar: string;
}

export interface Supplier {
    name: string;
    service: string;
    status: 'Active' | 'Pending' | 'Inactive';
}

export interface ProcurementItem {
    id: string;
    item: string;
    vendor: string;
    status: 'Ordered' | 'Received' | 'Pending';
    amount: string;
    date: string;
}

export interface CashAdvanceItem {
    id: string;
    requester: string;
    purpose: string;
    status: 'Approved' | 'Settled' | 'Pending';
    amount: string;
    date: string;
}

export interface GanttTask {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
    assignee?: string;
}

export interface SCurvePoint {
    month: string;
    planned: number;
    actual: number;
}

export interface KYCDocument {
    name: string;
    type: 'Legal' | 'Financial' | 'Technical' | 'Compliance';
    status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted';
    submissionDate?: string;
    verifiedBy?: string;
}

export interface RiskItem {
    description: string;
    category: 'Safety' | 'Financial' | 'Operational' | 'Environmental';
    probability: 'High' | 'Medium' | 'Low';
    impact: 'High' | 'Medium' | 'Low';
    mitigation: string;
    status: 'Active' | 'Mitigated' | 'Closed';
}

export interface ProjectDocument {
    id: string;
    name: string;
    type: 'Contract' | 'Invoice' | 'Report' | 'Proposal' | 'Other';
    size: string;
    uploadDate: string;
    uploadedBy: string;
}

export interface ActivityFeedItem {
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success';
}

export interface Project {
    id: string;
    name: string;
    manager: string;
    type: string;
    status: 'In Planning' | 'In Progress' | 'On Hold' | 'Completed';
    progress: number;
    // Health Dashboard Fields
    health: 'Good' | 'At Risk' | 'Critical';
    scheduleVariance: number; // days (+ ahead, - behind)
    budgetUsed: number; // percentage
    // New Budget Insights
    budgetStats: {
        timelineProgress: number; // percentage of time elapsed
        forecastCompletion: number; // projected budget usage at end
        burnRateMessage: string; // e.g., "Overspending +10%"
        status: 'On Track' | 'Overspending' | 'Underbudget';
    };
    riskStats: { high: number; med: number; low: number };
    taskStats: { open: number; inProgress: number; overdue: number; completed: number };
    activityFeed: ActivityFeedItem[];
    // Standard Fields
    startDate: string;
    endDate: string;
    budget: string;
    description: string;
    client: string;
    priority: 'High' | 'Medium' | 'Low';
    location: string;
    team: TeamMember[];
    suppliers: Supplier[];
    contactEmail: string;
    contactPhone: string;
    // New data for tabs
    procurements: ProcurementItem[];
    cashAdvances: CashAdvanceItem[];
    ganttTasks: GanttTask[];
    sCurve: SCurvePoint[];
    kycDocuments: KYCDocument[];
    risks: RiskItem[];
    documents: ProjectDocument[];
}

export interface SimulationResult {
    predictedCompletionDate: Date;
    delayDays: number;
    budgetForecast: {
        overrun: boolean;
        predictedAtCompletion: number;
    };
    overrun?: boolean;
    predictedAtCompletion?: number;
    confidenceScore: number;
    criticalPath: string[];
    risks: { task: string; risk: string }[];
    task?: string;
    risk?: string;
    recommendations: string[];
}
