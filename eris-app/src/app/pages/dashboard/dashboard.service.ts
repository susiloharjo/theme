import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardWidget } from './dashboard.component';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://localhost:3000/api/dashboard';

    constructor(private http: HttpClient) { }

    getWidgets(dashboardId: string = 'main'): Observable<DashboardWidget[]> {
        return this.http.get<{ data: DashboardWidget[] }>(`${this.apiUrl}/${dashboardId}`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error('Error fetching widgets', error);
                return of([]);
            })
        );
    }

    saveWidgets(dashboardId: string, widgets: DashboardWidget[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/${dashboardId}`, { widgets }).pipe(
            catchError(error => {
                console.error('Error saving widgets', error);
                return of({ error: true });
            })
        );
    }
}
