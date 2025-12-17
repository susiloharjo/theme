import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchResult {
    id: string;
    objectType: string;
    objectId: string;
    referenceNo?: string;
    title: string;
    subtitle?: string;
    description?: string;
    status?: string;
    ownerName?: string;
    department?: string;
    amount?: number;
    currency?: string;
    datePrimary?: string;
    tags?: string[];
    _score?: number;
}

export interface SearchResponse {
    results: SearchResult[];
    totalCount: number;
    facets: any;
}

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = 'http://localhost:3006/api/search';

    constructor(private http: HttpClient) { }

    search(query: string, filters: any = {}): Observable<SearchResponse> {
        return this.http.post<SearchResponse>(this.apiUrl, { query, filters });
    }
}
