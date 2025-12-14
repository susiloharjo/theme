import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SearchRequest, SearchResponse, SearchFacets } from './search.types';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = '/api/search';

    constructor(private http: HttpClient) { }

    /**
     * Perform search with query and filters
     */
    search(request: SearchRequest): Observable<SearchResponse> {
        return this.http.post<SearchResponse>(this.apiUrl, {
            query: request.query || '',
            filters: request.filters || {},
            page: request.page || 1,
            size: request.size || 20
        }).pipe(
            catchError(error => {
                console.error('Search error:', error);
                return of({
                    results: [],
                    facets: { objectType: [], status: [] },
                    totalCount: 0,
                    page: 1,
                    size: 20
                });
            })
        );
    }

    /**
     * Get all available facets
     */
    getFacets(): Observable<SearchFacets> {
        return this.http.get<SearchFacets>(`${this.apiUrl}/facets`).pipe(
            catchError(error => {
                console.error('Facets error:', error);
                return of({
                    objectType: [],
                    status: []
                });
            })
        );
    }

    /**
     * Trigger index rebuild
     */
    rebuildIndex(): Observable<{ message: string; success: boolean; count?: number }> {
        return this.http.post<{ message: string; success: boolean; count?: number }>(`${this.apiUrl}/rebuild`, {}).pipe(
            catchError(error => {
                console.error('Rebuild error:', error);
                return of({ message: error.message, success: false });
            })
        );
    }

    /**
     * Get index statistics
     */
    getStats(): Observable<{ totalCount: number; byType: { type: string; count: number }[] }> {
        return this.http.get<{ totalCount: number; byType: { type: string; count: number }[] }>(`${this.apiUrl}/stats`).pipe(
            catchError(error => {
                console.error('Stats error:', error);
                return of({ totalCount: 0, byType: [] });
            })
        );
    }
}
