import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface WidgetTemplate {
    id: string;
    name: string;
    type: string;
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
    templateGroups: { name: string, templates: WidgetTemplate[] }[] = [];

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
                                    if (typeof config.content === 'string' && (config.content.startsWith('{') || config.content.startsWith('['))) {
                                        try { meta = JSON.parse(config.content); } catch (e) { meta = { content: config.content }; }
                                    } else {
                                        meta = { content: config.content };
                                    }
                                }
                                if (config.meta && typeof config.meta === 'string') {
                                    try { meta = { ...meta, ...JSON.parse(config.meta) }; } catch (e) { /* ignore */ }
                                } else if (config.meta) {
                                    meta = { ...meta, ...config.meta };
                                }
                            } catch (e) {
                                console.error('Error parsing template config', t.id, e);
                            }

                            if (!config.title) config.title = t.name;
                            if (!config.type) config.type = t.type;
                            if (!config.value && t.type === 'stat') config.value = '0';

                            return { ...t, config, meta };
                        });
                        this.filterTemplates();
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

        // Then group
        const groups: { [key: string]: WidgetTemplate[] } = {};
        this.categoryOrder.forEach(cat => groups[cat] = []);

        searched.forEach(t => {
            // User requested to remove "Team member cards" which are 'stat' type
            if (t.type === 'stat') return;

            // Genericize names for the library view
            if (t.type === 'shortcut') {
                t.name = 'Shortcut';
                if (t.config) t.config.title = 'Shortcut';
            }
            // Optional: Genericize others if needed, but 'shortcut' was the specific request context

            const cat = this.mapTypeToCategory(t.type);
            if (groups[cat]) {
                // Check if we already have this type in this group (Deduplicate styles)
                const exists = groups[cat].find(existing => existing.type === t.type);
                if (!exists) {
                    groups[cat].push(t);
                }
            } else {
                // Fallback to Standard chart card
                // Also check for duplicates in the fallback group
                const fallbackGroup = groups['Standard chart card'];
                const exists = fallbackGroup.find(existing => existing.type === t.type);
                if (!exists) {
                    fallbackGroup.push(t);
                }
            }
        });

        this.templateGroups = this.categoryOrder
            .map(name => ({ name, templates: groups[name] }))
            .filter(g => g.templates.length > 0);
    }

    mapTypeToCategory(type: string): string {
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
