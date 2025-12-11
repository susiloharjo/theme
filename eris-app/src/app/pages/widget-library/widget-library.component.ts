import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface WidgetTemplate {
    id: string;
    name: string;
    type: string;
    defaultConfig: string; // JSON string
}

@Component({
    selector: 'app-widget-library',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './widget-library.component.html'
})
export class WidgetLibraryComponent implements OnInit {
    templates: any[] = [];
    loading = true;

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.fetchTemplates();
    }

    fetchTemplates() {
        console.log('Fetching templates from /api/templates...');
        this.http.get<{ message: string, data: WidgetTemplate[] }>('/api/templates')
            .subscribe({
                next: (response) => {
                    console.log('Templates data received:', response);
                    if (response && response.data) {
                        this.templates = response.data.map(t => {
                            let config: any = {};
                            let meta: any = {};
                            try {
                                config = t.defaultConfig ? JSON.parse(t.defaultConfig) : {};
                                if (config.content) {
                                    meta = JSON.parse(config.content);
                                }
                            } catch (e) {
                                console.error('Error parsing template config', t.id, e);
                            }

                            // Mock values for preview if missing
                            if (!config.value) config.value = '100'; // Default for stats

                            return {
                                ...t,
                                config,
                                meta
                            };
                        });
                    }
                    this.loading = false;
                    console.log('Templates processed, loading set to false');
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Failed to load templates', err);
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
    }

    getIconClass(icon: string | undefined): string {
        // Simple helper to return keys found in dashboard.html/sidebar
        return icon || 'box';
    }
}
