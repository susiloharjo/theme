import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from './pmo.types';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'http://localhost:3006/api/pmo/projects';

    constructor(private http: HttpClient) { }

    getProjects(): Observable<Project[]> {
        return this.http.get<{ message: string, data: Project[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }
}
