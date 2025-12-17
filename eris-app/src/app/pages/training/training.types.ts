export interface Training {
    id: string;
    topic: string;
    provider: string;
    type: string;
    location: string;
    startDate: string;
    endDate: string;
    status: 'Pending Approval' | 'Approved' | 'In Progress';
    cost: string;
}
