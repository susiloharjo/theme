import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EditTemplateSidebarComponent } from './components/edit-template-sidebar/edit-template-sidebar.component';

interface WidgetTemplate {
    id: string;
    name: string;
    type: string;
    defaultConfig: string; // JSON string
}

@Component({
    selector: 'app-widget-library',
    standalone: true,
    imports: [CommonModule, EditTemplateSidebarComponent],
    templateUrl: './widget-library.component.html'
})
export class WidgetLibraryComponent implements OnInit {
    templates: any[] = [];
    loading = true;

    // Edit Modal State
    showEditTemplateModal = false;
    editingTemplate: any = null;
    tempTemplateConfig: any = {};

    // Available routes for navigation actions
    availableRoutes = [
        { path: '/myhome', label: 'My Home' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'My Profile' },
        { path: '/training', label: 'Training' },
        { path: '/purchase', label: 'Purchase' },
        { path: '/reimbursement', label: 'Reimbursement' },
        { path: '/cash-advance', label: 'Cash Advance' },
        { path: '/pmo', label: 'PMO' },
        { path: '/crm', label: 'CRM' }
    ];

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
                                    if (typeof config.content === 'string') {
                                        try {
                                            meta = JSON.parse(config.content);
                                        } catch (e) {
                                            // Maybe it's just a string content
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

    editTemplate(template: any) {
        this.editingTemplate = template;

        // Deep copy config to temp
        this.tempTemplateConfig = JSON.parse(JSON.stringify(template.config));

        // Note: we Keep content as object if possible, EditTemplateSidebar will handle display


        this.showEditTemplateModal = true;
    }

    saveTemplate(newConfig: any) {
        if (!this.editingTemplate) return;

        // Prepare payload
        // We need to parse the content back to object if it was edited as JSON string in text area
        let finalConfig = { ...newConfig };
        try {
            if (typeof finalConfig.content === 'string' && (finalConfig.content.startsWith('{') || finalConfig.content.startsWith('['))) {
                finalConfig.content = JSON.parse(finalConfig.content);
            }
        } catch (e) {
            console.error('Failed to parse content JSON', e);
            alert('Invalid JSON in Content field');
            return;
        }

        const payload = {
            defaultConfig: JSON.stringify(finalConfig)
        };

        this.http.put(`/api/templates/${this.editingTemplate.id}`, payload)
            .subscribe({
                next: (res) => {
                    console.log('Template saved', res);
                    this.showEditTemplateModal = false;
                    this.fetchTemplates(); // Reload
                },
                error: (err) => {
                    console.error('Error saving template', err);
                    alert('Failed to save template');
                }
            });
    }

    deleteTemplate(template: any) {
        if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
            return;
        }

        this.http.delete(`/api/templates/${template.id}`)
            .subscribe({
                next: () => {
                    this.templates = this.templates.filter(t => t.id !== template.id);
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error deleting template', err);
                    if (err.status === 409) {
                        alert('Cannot delete template. It is currently used by widgets on the dashboard. Please remove them first.');
                    } else {
                        alert('Failed to delete template');
                    }
                }
            });
    }

    getIconClass(icon: string | undefined): string {
        // Simple helper to return keys found in dashboard.html/sidebar
        return icon || 'box';
    }
}
