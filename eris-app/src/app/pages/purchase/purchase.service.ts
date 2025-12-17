import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TrackingStep {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed' | 'rejected' | 'revision';
    date?: string;
    details?: string[];
}

export interface PurchaseRequest {
    id: string;
    title: string;
    requester: string;
    department: string;
    requestDate: string;
    totalAmount: number;
    status: string;
    steps: TrackingStep[];
    // helper for frontend logic, can be mapped from steps or calculated
    currentStepIndex?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    private apiUrl = '/api/purchases'; // Proxied to localhost:3000

    constructor(private http: HttpClient) { }

    getPurchases(): Observable<PurchaseRequest[]> {
        return this.http.get<{ message: string, data: any[] }>(this.apiUrl).pipe(
            map(response => response.data.map(item => {
                // Map backend fields to frontend interface if needed
                // steps is already parsed JSON from the API

                // Calculate current step index if not present
                let currentStepIndex = 0;
                if (item.steps && Array.isArray(item.steps)) {
                    // Find last completed or active step
                    // Simple logic: find index of last non-pending step
                    // Or use the one marked 'active' or 'rejected'
                    const activeIdx = item.steps.findIndex((s: TrackingStep) => s.status === 'active' || s.status === 'rejected' || s.status === 'revision');
                    if (activeIdx >= 0) {
                        currentStepIndex = activeIdx;
                    } else {
                        // if all completed, it's the last one
                        if (item.status === 'Completed') currentStepIndex = item.steps.length - 1;
                    }
                }

                return {
                    ...item,
                    totalAmount: parseFloat(item.totalAmount), // Prisma returns Decimal as string usually, or we fix in backend
                    currentStepIndex
                } as PurchaseRequest;
            }))
        );
    }
}
