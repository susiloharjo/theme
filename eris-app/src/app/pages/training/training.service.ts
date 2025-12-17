import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Training } from './training.types';

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private apiUrl = 'http://localhost:3006/api/training/sessions';

    constructor(private http: HttpClient) { }

    getTrainings(): Observable<Training[]> {
        return this.http.get<{ message: string, data: Training[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }
}
