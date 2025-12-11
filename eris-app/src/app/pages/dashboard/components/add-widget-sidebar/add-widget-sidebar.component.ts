import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface WidgetTemplate {
    id: string;
    name: string;
    type: string;
    description?: string;
    defaultConfig: string;
    // Parsed properties for UI
    config?: any;
    meta?: any;
}

@Component({
    selector: 'app-add-widget-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-widget-sidebar.component.html'
})
export class AddWidgetSidebarComponent implements OnInit {
    @Input() isVisible = false;
    @Output() close = new EventEmitter<void>();
    @Output() add = new EventEmitter<any>();

    templates: WidgetTemplate[] = [];
    filteredTemplates: WidgetTemplate[] = [];
    loading = false;
    searchQuery = '';
    selectedCategory = 'All';

    // user requested groups: standard chart card, pie chart card, line chart card, picture card, list card, table card, bar chart card
    // user requested groups: standard chart card, pie chart card, line chart card, picture card, list card, table card, bar chart card
    displayedTemplates: WidgetTemplate[] = [];

    // Exact mapping requested
    categoryOrder = [
        'Standard chart card',
        'Pie chart card',
        'Line chart card',
        'Picture card',
        'List card',
        'Table card',
        'Bar chart card'
    ];

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.fetchTemplates();
    }

    fetchTemplates() {
        this.loading = true;
        this.http.get<{ message: string, data: WidgetTemplate[] }>('/api/templates')
            .subscribe({
                next: (response) => {
                    if (response && response.data) {
                        this.templates = response.data.map(t => {
                            let config: any = {};
                            let meta: any = {};
                            try {
                                config = t.defaultConfig ? JSON.parse(t.defaultConfig) : {};
                                if (config.content) {
                                    if (typeof config.content === 'string') {
                                        try {
                                            meta = JSON.parse(config.content);
                                        } catch (e) {
                                            console.warn('Could not parse content string as JSON', config.content);
                                            meta = { text: config.content };
                                        }
                                    } else {
                                        // It's already an object (e.g. from seed)
                                        meta = config.content;
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing template config', t.id, e);
                            }

                            // Extract value from content if present (new structure)
                            if (config.content && typeof config.content === 'object' && config.content.value) {
                                config.value = config.content.value;
                            }

                            // Mock values for preview if missing
                            if (!config.value) config.value = '100'; // Default for stats

                            if (!config.title) config.title = t.name;
                            if (!config.type) config.type = t.type;

                            return { ...t, config, meta };
                        });
                        this.filterTemplates(); // Initial filter after fetching
                    }
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Failed to load templates', err);
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
    }

    filterTemplates() {
        // First filter by search
        const searched = this.templates.filter(t =>
            t.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        // Show all templates, matching Widget Library behavior
        this.displayedTemplates = searched;
    }

    mapTypeToCategory(type: string): string {
        // Kept for reference or future use, but not strictly needed for flat list
        switch (type) {
            case 'stat': return 'Standard chart card';
            case 'pie': return 'Pie chart card';
            case 'line': return 'Line chart card';
            case 'picture': return 'Picture card';
            case 'list': return 'List card';
            case 'bar': return 'Bar chart card';
            // case 'table': return 'Table card'; // If we had table type
            default: return 'Standard chart card';
        }
    }


    onSearch() {
        this.filterTemplates();
    }

    onClose() {
        this.close.emit();
    }

    onAdd(template: WidgetTemplate) {
        this.add.emit(template);
    }
}
