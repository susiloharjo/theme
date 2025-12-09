import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TeamMember {
    name: string;
    role: string;
    avatar: string;
}

interface Supplier {
    name: string;
    service: string;
    status: 'Active' | 'Pending' | 'Inactive';
}

interface ProcurementItem {
    id: string;
    item: string;
    vendor: string;
    status: 'Ordered' | 'Received' | 'Pending';
    amount: string;
    date: string;
}

interface CashAdvanceItem {
    id: string;
    requester: string;
    purpose: string;
    status: 'Approved' | 'Settled' | 'Pending';
    amount: string;
    date: string;
}

interface GanttTask {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
    assignee?: string;
}

interface SCurvePoint {
    month: string;
    planned: number;
    actual: number;
}

interface KYCDocument {
    name: string;
    type: 'Legal' | 'Financial' | 'Technical' | 'Compliance';
    status: 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted';
    submissionDate?: string;
    verifiedBy?: string;
}

interface RiskItem {
    description: string;
    category: 'Safety' | 'Financial' | 'Operational' | 'Environmental';
    probability: 'High' | 'Medium' | 'Low';
    impact: 'High' | 'Medium' | 'Low';
    mitigation: string;
    status: 'Active' | 'Mitigated' | 'Closed';
}

interface ProjectDocument {
    id: string;
    name: string;
    type: 'Contract' | 'Invoice' | 'Report' | 'Proposal' | 'Other';
    size: string;
    uploadDate: string;
    uploadedBy: string;
}

interface ActivityFeedItem {
    message: string;
    timestamp: string; // e.g. "2h ago", "Yesterday"
    type: 'info' | 'warning' | 'success';
}

interface Project {
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

interface SimulationResult {
    predictedCompletionDate: Date;
    delayDays: number;
    budgetForecast: {
        overrun: boolean;
        predictedAtCompletion: number;
    };
    confidenceScore: number;
    criticalPath: string[];
    risks: { task: string; risk: string }[];
    recommendations: string[];
}

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './project-list.html',
})
export class ProjectListComponent implements OnInit {

    constructor(private cdr: ChangeDetectorRef) { }

    selectedProject: Project | null = null;
    searchTerm: string = '';
    activeTab: 'org-chart' | 'procurement' | 'cash-advance' | 'gantt' | 's-curve' | 'financial' | 'kyc' | 'risk' | 'documents' = 'gantt';
    expandedFinancialCategory: string | null = null;

    // AI Simulation State
    showSimulationModal = false;
    simulationLoading = false;
    simulationResult: any = null;


    projects: Project[] = [
        {
            id: 'PROJ-001',
            name: 'ERP Implementation Phase 1',
            manager: 'Sarah Connor',
            type: 'IT Infrastructure',
            status: 'In Progress',
            progress: 65,
            health: 'Good',
            scheduleVariance: -5,
            budgetUsed: 65,
            budgetStats: {
                timelineProgress: 55,
                forecastCompletion: 115,
                burnRateMessage: 'Overspending +10%',
                status: 'Overspending'
            },
            riskStats: { high: 2, med: 1, low: 3 },
            taskStats: { open: 22, inProgress: 14, overdue: 6, completed: 35 },
            activityFeed: [
                { message: 'Task "Requirement Gathering" completed', timestamp: '2h ago', type: 'success' },
                { message: 'Risk added: Vendor delay potential', timestamp: '4h ago', type: 'warning' },
                { message: 'File uploaded: architecture_v2.pdf', timestamp: 'Yesterday', type: 'info' }
            ],
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            budget: 'Rp 1,500,000,000',
            description: 'Implementation of the core ERP modules including Finance, Procurement, and Inventory. Phase 1 focuses on headquarters rollout.',
            client: 'Internal - Ops',
            priority: 'High',
            location: 'Jakarta HQ',
            contactEmail: 's.connor@sky.net',
            contactPhone: '+62 812 3456 7890',
            team: [
                { name: 'Kyle Reese', role: 'Tech Lead', avatar: 'https://ui-avatars.com/api/?name=Kyle+Reese&background=random' },
                { name: 'T-800', role: 'System Architect', avatar: 'https://ui-avatars.com/api/?name=T+800&background=random' },
                { name: 'John Connor', role: 'Business Analyst', avatar: 'https://ui-avatars.com/api/?name=John+Connor&background=random' }
            ],
            suppliers: [
                { name: 'Oracle Corp', service: 'Software License', status: 'Active' },
                { name: 'AWS', service: 'Cloud Hosting', status: 'Active' }
            ],
            procurements: [
                { id: 'PO-001', item: 'Server Racks', vendor: 'Dell', status: 'Received', amount: 'Rp 250,000,000', date: '2024-02-10' },
                { id: 'PO-002', item: 'Software Licenses', vendor: 'Oracle', status: 'Ordered', amount: 'Rp 500,000,000', date: '2024-03-01' }
            ],
            cashAdvances: [
                { id: 'CA-001', requester: 'Kyle Reese', purpose: 'Site Survey Travel', status: 'Settled', amount: 'Rp 5,000,000', date: '2024-01-20' },
                { id: 'CA-002', requester: 'T-800', purpose: 'Team Lunch', status: 'Approved', amount: 'Rp 2,000,000', date: '2024-02-15' }
            ],
            ganttTasks: [
                { id: 'T1', name: 'Requirement Gathering', startDate: '2024-01-01', endDate: '2024-01-31', progress: 100, status: 'Completed', assignee: 'John Connor' },
                { id: 'T2', name: 'System Design & Architecture', startDate: '2024-02-01', endDate: '2024-02-28', progress: 100, status: 'Completed', assignee: 'T-800' },
                { id: 'T3', name: 'Infrastructure Setup', startDate: '2024-02-15', endDate: '2024-03-15', progress: 100, status: 'Completed', assignee: 'Kyle Reese' },
                { id: 'T4', name: 'Module Configuration', startDate: '2024-03-01', endDate: '2024-05-15', progress: 60, status: 'In Progress', assignee: 'Sarah Connor' },
                { id: 'T5', name: 'User Acceptance Testing', startDate: '2024-05-15', endDate: '2024-06-15', progress: 0, status: 'Pending' },
                { id: 'T6', name: 'Go-Live Preparation', startDate: '2024-06-01', endDate: '2024-06-30', progress: 0, status: 'Pending' }
            ],
            sCurve: [
                { month: 'Jan', planned: 5, actual: 4 },
                { month: 'Feb', planned: 15, actual: 12 },
                { month: 'Mar', planned: 30, actual: 25 },
                { month: 'Apr', planned: 55, actual: 45 },
                { month: 'May', planned: 80, actual: 65 },
                { month: 'Jun', planned: 100, actual: 0 }
            ],
            kycDocuments: [
                { name: 'Business License (NIB)', type: 'Legal', status: 'Verified', submissionDate: '2023-12-15', verifiedBy: 'Legal Dept' },
                { name: 'Tax ID (NPWP)', type: 'Financial', status: 'Verified', submissionDate: '2023-12-15', verifiedBy: 'Finance Dept' },
                { name: 'ISO 27001 Certificate', type: 'Compliance', status: 'Pending', submissionDate: '2024-01-20' },
                { name: 'Vendor Integrity Pact', type: 'Legal', status: 'Verified', submissionDate: '2023-12-20', verifiedBy: 'Compliance Dept' }
            ],
            risks: [
                { description: 'Data Migration Failure', category: 'Operational', probability: 'Medium', impact: 'High', mitigation: 'Full backup and dry run before cutover.', status: 'Active' },
                { description: 'Budget Overrun due to Licensing', category: 'Financial', probability: 'Low', impact: 'Medium', mitigation: 'Fixed price contract negotiated with Oracle.', status: 'Mitigated' },
                { description: 'User Resistance to Change', category: 'Operational', probability: 'High', impact: 'Medium', mitigation: 'Comprehensive training and change management program.', status: 'Active' }
            ],
            documents: [
                { id: 'DOC-001', name: 'Service Agreement v1.0', type: 'Contract', size: '2.5 MB', uploadDate: '2023-12-20', uploadedBy: 'Legal Team' },
                { id: 'DOC-002', name: 'Project Proposal Final', type: 'Proposal', size: '1.8 MB', uploadDate: '2023-11-15', uploadedBy: 'Sarah Connor' },
                { id: 'DOC-003', name: 'Oracle License Invoice', type: 'Invoice', size: '0.5 MB', uploadDate: '2024-03-05', uploadedBy: 'Finance' }
            ]
        },
        {
            id: 'PROJ-002',
            name: 'New Warehouse Construction',
            manager: 'John Matrix',
            type: 'Construction',
            status: 'In Planning',
            progress: 10,
            health: 'Good',
            scheduleVariance: 5,
            budgetUsed: 25,
            budgetStats: {
                timelineProgress: 20,
                forecastCompletion: 98,
                burnRateMessage: 'On Track',
                status: 'On Track'
            },
            riskStats: { high: 0, med: 1, low: 4 },
            taskStats: { open: 15, inProgress: 8, overdue: 0, completed: 5 },
            activityFeed: [
                { message: 'Project Charter Approved', timestamp: '2 days ago', type: 'success' }
            ],
            startDate: '2024-03-01',
            endDate: '2024-12-20',
            budget: 'Rp 5,000,000,000',
            description: 'Construction of a new distribution center in Cikarang industrial estate. Includes land clearing, foundation, and main structure.',
            client: 'Logistics Dept',
            priority: 'High',
            location: 'Cikarang',
            contactEmail: 'j.matrix@commando.mil',
            contactPhone: '+62 813 9999 8888',
            team: [
                { name: 'Cindy', role: 'Civil Engineer', avatar: 'https://ui-avatars.com/api/?name=Cindy&background=random' },
                { name: 'Bennett', role: 'Safety Officer', avatar: 'https://ui-avatars.com/api/?name=Bennett&background=random' }
            ],
            suppliers: [
                { name: 'Holcim', service: 'Concrete', status: 'Pending' },
                { name: 'Krakatau Steel', service: 'Steel Beams', status: 'Active' }
            ],
            procurements: [],
            cashAdvances: [],
            ganttTasks: [],
            sCurve: [],
            kycDocuments: [],
            risks: [
                { description: 'Workplace Accident', category: 'Safety', probability: 'Medium', impact: 'High', mitigation: 'Strict HSE protocols and daily safety briefings.', status: 'Active' },
                { description: 'Weather Delays', category: 'Environmental', probability: 'High', impact: 'Medium', mitigation: 'Flexible schedule and rain shelters.', status: 'Active' }
            ],
            documents: []
        },
        // ... other projects with empty arrays for new fields or copied data
        {
            id: 'PROJ-003',
            name: 'Digital Marketing Campaign Q2',
            manager: 'Ellen Ripley',
            type: 'Marketing',
            status: 'Completed',
            progress: 100,
            health: 'Good',
            scheduleVariance: 2,
            budgetUsed: 98,
            budgetStats: {
                timelineProgress: 100,
                forecastCompletion: 98,
                burnRateMessage: 'Underbudget -2%',
                status: 'Underbudget'
            },
            riskStats: { high: 0, med: 0, low: 0 },
            taskStats: { open: 0, inProgress: 0, overdue: 0, completed: 25 },
            activityFeed: [
                { message: 'Final Report Submitted', timestamp: '1 week ago', type: 'success' }
            ],
            startDate: '2024-04-01',
            endDate: '2024-06-30',
            budget: 'Rp 250,000,000',
            description: 'Social media and SEO campaign for the new product launch. Targeting Gen Z demographic across TikTok and Instagram.',
            client: 'Marketing Dept',
            priority: 'Medium',
            location: 'Remote',
            contactEmail: 'e.ripley@weyland.yutani',
            contactPhone: '+62 811 2233 4455',
            team: [
                { name: 'Newt', role: 'Content Creator', avatar: 'https://ui-avatars.com/api/?name=Newt&background=random' },
                { name: 'Bishop', role: 'Analytics', avatar: 'https://ui-avatars.com/api/?name=Bishop&background=random' }
            ],
            suppliers: [
                { name: 'Meta Ads', service: 'Ad Platform', status: 'Inactive' },
                { name: 'Google Ads', service: 'Ad Platform', status: 'Inactive' }
            ],
            procurements: [],
            cashAdvances: [],
            ganttTasks: [],
            sCurve: [],
            kycDocuments: [],
            risks: [],
            documents: []
        },
        {
            id: 'PROJ-004',
            name: 'HR Policy Revisions',
            manager: 'Peter Venkman',
            type: 'Internal Process',
            status: 'On Hold',
            progress: 45,
            health: 'At Risk',
            scheduleVariance: -10,
            budgetUsed: 40,
            budgetStats: {
                timelineProgress: 35,
                forecastCompletion: 105,
                burnRateMessage: 'Slight Overspend',
                status: 'Overspending'
            },
            riskStats: { high: 1, med: 3, low: 2 },
            taskStats: { open: 8, inProgress: 4, overdue: 2, completed: 12 },
            activityFeed: [
                { message: 'Project put on hold pending review', timestamp: '1 month ago', type: 'warning' }
            ],
            startDate: '2024-02-10',
            endDate: '2024-05-30',
            budget: 'Rp 50,000,000',
            description: 'Comprehensive review and update of company employment policies to align with new labor regulations.',
            client: 'HR Dept',
            priority: 'Low',
            location: 'Jakarta HQ',
            contactEmail: 'p.venkman@ghost.busters',
            contactPhone: '+62 815 6677 8899',
            team: [
                { name: 'Egon Spengler', role: 'Legal Advisor', avatar: 'https://ui-avatars.com/api/?name=Egon+Spengler&background=random' },
                { name: 'Dana Barrett', role: 'HR Manager', avatar: 'https://ui-avatars.com/api/?name=Dana+Barrett&background=random' }
            ],
            suppliers: [],
            procurements: [],
            cashAdvances: [],
            ganttTasks: [],
            sCurve: [],
            kycDocuments: [],
            risks: [],
            documents: []
        },
        {
            id: 'PROJ-005',
            name: 'Mobile App Development',
            manager: 'Neo Anderson',
            type: 'Software Development',
            status: 'In Progress',
            progress: 30,
            health: 'Critical',
            scheduleVariance: -20,
            budgetUsed: 50,
            budgetStats: {
                timelineProgress: 40,
                forecastCompletion: 130,
                burnRateMessage: 'Overspending +30%',
                status: 'Overspending'
            },
            riskStats: { high: 4, med: 2, low: 1 },
            taskStats: { open: 45, inProgress: 15, overdue: 12, completed: 10 },
            activityFeed: [
                { message: 'Critical bug reported in login module', timestamp: '1h ago', type: 'warning' }
            ],
            startDate: '2024-05-01',
            endDate: '2024-11-30',
            budget: 'Rp 800,000,000',
            description: 'Development of the customer-facing mobile application for iOS and Android. Features include order tracking and loyalty points.',
            client: 'Retail Div',
            priority: 'High',
            location: 'Bandung Hub',
            contactEmail: 'neo@matrix.sys',
            contactPhone: '+62 818 0000 1010',
            team: [
                { name: 'Trinity', role: 'UI/UX Designer', avatar: 'https://ui-avatars.com/api/?name=Trinity&background=random' },
                { name: 'Morpheus', role: 'Backend Lead', avatar: 'https://ui-avatars.com/api/?name=Morpheus&background=random' }
            ],
            suppliers: [
                { name: 'Firebase', service: 'Backend BaaS', status: 'Active' }
            ],
            procurements: [],
            cashAdvances: [],
            ganttTasks: [],
            sCurve: [],
            kycDocuments: [],
            risks: [],
            documents: []
        },
        {
            id: 'PROJ-006',
            name: 'Customer Loyalty Program',
            manager: 'Dana Scully',
            type: 'Business Development',
            status: 'In Planning',
            progress: 0,
            health: 'Good',
            scheduleVariance: 2,
            budgetUsed: 10,
            budgetStats: {
                timelineProgress: 15,
                forecastCompletion: 95,
                burnRateMessage: 'Underbudget -5%',
                status: 'Underbudget'
            },
            riskStats: { high: 0, med: 2, low: 1 },
            taskStats: { open: 5, inProgress: 2, overdue: 0, completed: 8 },
            activityFeed: [],
            startDate: '2024-07-01',
            endDate: '2024-12-31',
            budget: 'Rp 300,000,000',
            description: 'Designing a new tiered loyalty program to increase customer retention. Includes partnership with external merchants.',
            client: 'Sales Dept',
            priority: 'Medium',
            location: 'Jakarta HQ',
            contactEmail: 'scully@fbi.gov',
            contactPhone: '+62 812 9988 7766',
            team: [
                { name: 'Fox Mulder', role: 'Strategy', avatar: 'https://ui-avatars.com/api/?name=Fox+Mulder&background=random' }
            ],
            suppliers: [],
            procurements: [],
            cashAdvances: [],
            ganttTasks: [],
            sCurve: [],
            kycDocuments: [],
            risks: [],
            documents: []
        }
    ];

    get filteredProjects() {
        if (!this.searchTerm) return this.projects;
        return this.projects.filter(p =>
            p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    ngOnInit() {
        if (this.projects.length > 0) {
            this.selectedProject = this.projects[0];
        }
    }

    selectProject(project: Project) {
        this.selectedProject = project;
        this.activeTab = 'org-chart'; // Reset tab on selection
    }

    getTaskStyle(task: GanttTask): { [key: string]: string } {
        if (!this.selectedProject) return {};

        const projectStart = new Date(this.selectedProject.startDate).getTime();
        const projectEnd = new Date(this.selectedProject.endDate).getTime();
        const totalDuration = projectEnd - projectStart;

        const taskStart = new Date(task.startDate).getTime();
        const taskEnd = new Date(task.endDate).getTime();

        if (totalDuration <= 0) return { left: '0%', width: '0%' };

        let leftPercent = ((taskStart - projectStart) / totalDuration) * 100;
        let widthPercent = ((taskEnd - taskStart) / totalDuration) * 100;

        // Clamp values
        if (leftPercent < 0) leftPercent = 0;
        if (widthPercent + leftPercent > 100) widthPercent = 100 - leftPercent;

        return {
            'left': `${leftPercent}%`,
            'width': `${widthPercent}%`
        };
    }

    getSCurvePath(type: 'planned' | 'actual'): string {
        if (!this.selectedProject || !this.selectedProject.sCurve || this.selectedProject.sCurve.length === 0) return '';

        const data = this.selectedProject.sCurve;
        const width = 100; // units
        const height = 100; // units

        const stepX = width / (data.length - 1);

        let path = '';
        data.forEach((point, index) => {
            const x = index * stepX;
            // Invert Y because SVG coordinates top-left is 0,0
            const val = type === 'planned' ? point.planned : point.actual;
            if (val === undefined || val === null && type === 'actual') return; // handle missing actuals for future

            const y = height - val;

            if (index === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });

        return path;
    }

    toggleFinancialCategory(category: string) {
        if (this.expandedFinancialCategory === category) {
            this.expandedFinancialCategory = null;
        } else {
            this.expandedFinancialCategory = category;
        }
    }

    // --- AI SIMULATION LOGIC ---
    runSimulation() {
        console.log('Run simulation clicked');
        this.showSimulationModal = true;
        this.simulationLoading = true;
        this.simulationResult = null;

        // Simulate API delay
        setTimeout(() => {
            try {
                if (this.selectedProject) {
                    this.calculateSimulation(this.selectedProject);
                } else {
                    console.warn('No project selected for simulation');
                    this.simulationLoading = false;
                }
            } catch (error) {
                console.error('Simulation failed:', error);
                this.simulationLoading = false;
            } finally {
                this.cdr.detectChanges();
            }
        }, 5000); // 5 second delay to simulate AI processing
    }

    calculateSimulation(project: Project) {
        console.log('Calculating simulation for', project.name);

        // SAFEGUARD: Ensure budgetStats exists
        if (!project.budgetStats) {
            console.warn('Missing budgetStats for project');
            // Create default stats if missing to prevent crash
            project.budgetStats = { timelineProgress: 0, forecastCompletion: 0, burnRateMessage: 'N/A', status: 'On Track' };
        }

        // 1. Calculate Schedule Deviation
        // Simple logic: If progress < timelineProgress, assume delay
        const deviation = (project.budgetStats?.timelineProgress || 0) - (project.progress || 0);
        let delayDays = 0;

        const today = new Date();
        const endDate = project.endDate ? new Date(project.endDate) : new Date();

        if (deviation > 5) {
            // Significant delay: Add 1.5 days for every 1% deviation
            delayDays = Math.ceil(deviation * 1.5);
        } else if (deviation < -5) {
            // Ahead of schedule
            delayDays = -Math.floor(Math.abs(deviation) * 0.5);
        }

        const predictedDate = new Date(endDate);
        predictedDate.setDate(predictedDate.getDate() + delayDays);

        // 2. Budget Forecast
        // Parse budget string to number (removing "Rp" and ",")
        const budgetStr = project.budget || '0';
        const budgetTotal = parseInt(budgetStr.replace(/[^0-9]/g, ''), 10) || 0;

        // Forecast based on current burn rate: (Budget / Progress) * 100
        // If progress is 0, avoid divide by zero
        const effectiveProgress = project.progress || 1;
        const predictedBudget = ((project.budgetStats?.forecastCompletion || 100) / 100) * budgetTotal;

        const isOverrun = predictedBudget > budgetTotal;


        // 3. Risks & Recommendations
        const newRisks = [];
        const recommendations = [];

        if (delayDays > 10) {
            newRisks.push({ task: 'Overall Schedule', risk: 'High' });
            recommendations.push('Consider fast-tracking critical path tasks.');
            recommendations.push('Negotiate timeline extension with stakeholders.');
        } else if (delayDays > 0) {
            newRisks.push({ task: 'Mid-term Milestones', risk: 'Medium' });
            recommendations.push('Monitor critical path closely.');
        }

        if (isOverrun) {
            newRisks.push({ task: 'Budget Control', risk: 'High' });
            recommendations.push('Review resource allocation and hourly rates.');
            recommendations.push('Freeze non-essential scope changes.');
        }

        if (project.riskStats && project.riskStats.high > 0) {
            recommendations.push('Detailed mitigation plan required for High priority risks.');
        }

        // Critical Path (Mock)
        const criticalPath = ['Requirement', 'Design', 'Dev', 'UAT', 'Go-Live'];

        this.simulationResult = {
            predictedCompletionDate: predictedDate,
            delayDays: delayDays,
            budgetForecast: {
                overrun: isOverrun,
                predictedAtCompletion: predictedBudget
            },
            confidenceScore: 0.85, // Mock confidence
            criticalPath: criticalPath,
            risks: newRisks.length ? newRisks : [{ task: 'None', risk: 'Low' }],
            recommendations: recommendations.length ? recommendations : ['Continue monitoring progress.']
        };

        this.simulationLoading = false;
    }
}

