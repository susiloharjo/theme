import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { GridStack, GridStackOptions } from 'gridstack';
import { EditShortcutSidebarComponent } from './components/edit-shortcut-sidebar/edit-shortcut-sidebar.component';
import { AddWidgetSidebarComponent } from './components/add-widget-sidebar/add-widget-sidebar.component';
import { EditTemplateSidebarComponent } from '../widget-library/components/edit-template-sidebar/edit-template-sidebar.component';

// Import gridstack CSS if not globally accessible
export interface DashboardWidget {
    id: string;
    titles?: string;
    title: string;
    type: 'stat' | 'chart' | 'list' | 'bar' | 'pie' | 'line' | 'shortcut' | 'picture';
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    content?: string;
    value?: string;
    icon?: string;
    color?: string;
    dashboard_id?: string;
    meta?: any; // Holds parsed content for complex widgets
    config?: any; // Parsed instance config
    template?: any; // Template reference
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, EditShortcutSidebarComponent, AddWidgetSidebarComponent, EditTemplateSidebarComponent],
    providers: [DashboardService],
    templateUrl: './dashboard.html',
    styles: [`
    :host {
    display: block;
    height: 100%;
}
`]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('gridStack') gridStackEl!: ElementRef;
    private grid!: GridStack;

    widgets: DashboardWidget[] = [];
    currentDashboardId = 'main';
    availableDashboards = ['main', 'analytics', 'projects'];

    isEditMode = false;
    isLoading = true;
    error: string | null = null;

    showAddWidgetSidebar = false;
    showEditWidgetSidebar = false;
    editingWidgetConfig: any = {};

    toggleAddWidgetSidebar() {
        this.showAddWidgetSidebar = !this.showAddWidgetSidebar;
    }

    onWidgetAddedFromSidebar(template: any) {
        // Map WidgetTemplate (from Sidebar/API) to DashboardWidget structure
        const mappedTemplate: Partial<DashboardWidget> = {
            ...template,
            title: template.config?.title || template.name,
            value: template.config?.value,
            icon: template.config?.icon,
            color: template.config?.color,
            content: template.config?.content ?
                (typeof template.config.content === 'string' ? template.config.content : JSON.stringify(template.config.content))
                : undefined
        };

        this.addWidget(mappedTemplate);
        this.showAddWidgetSidebar = false;
    }

    showShortcutModal = false;
    editingWidgetId: string | null = null;

    availableRoutes = [
        { path: '/myhome', label: 'My Home' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'My Profile' },
        { path: '/training', label: 'Training Overview' },
        { path: '/training/request', label: 'Training Request' },
        { path: '/purchase', label: 'Purchase Overview' },
        { path: '/purchase/request', label: 'Purchase Request' },
        { path: '/pmo/projects', label: 'PMO Projects' },
        { path: '/crm/dashboard', label: 'CRM Dashboard' }
    ];

    availableIcons = ['link', 'triangle', 'chevron', 'user', 'cart', 'gear', 'monitor', 'pie-chart', 'wrench', 'truck', 'home', 'search', 'bell', 'calendar'];

    tempShortcutConfig = {
        title: 'New Shortcut',
        link: '/myhome',
        label: 'Go to Home',
        icon: 'link',
        color: 'bg-blue-500'
    };

    constructor(
        private dashboardService: DashboardService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    addWidget(template: Partial<DashboardWidget>) {
        if (template.type === 'shortcut') {
            this.editingWidgetId = null;
            this.tempShortcutConfig = {
                title: 'New Shortcut',
                link: '/myhome',
                label: 'Go to Home',
                icon: template.icon || 'link',
                color: template.color || 'bg-blue-500'
            };
            this.showAddWidgetSidebar = false;
            this.showShortcutModal = true;
            return;
        }

        this.createWidget(template);
    }

    saveShortcutWidget() {
        const template: Partial<DashboardWidget> = {
            title: this.tempShortcutConfig.title,
            type: 'shortcut',
            icon: this.tempShortcutConfig.icon,
            color: this.tempShortcutConfig.color,
            content: JSON.stringify({
                link: this.tempShortcutConfig.link,
                label: this.tempShortcutConfig.label
            })
        };

        if (this.editingWidgetId) {
            const widgetIndex = this.widgets.findIndex(w => w.id === this.editingWidgetId);
            if (widgetIndex > -1) {
                const updatedWidget = {
                    ...this.widgets[widgetIndex],
                    ...template,
                    meta: JSON.parse(template.content!)
                };
                this.widgets[widgetIndex] = updatedWidget as DashboardWidget;
                this.cdr.detectChanges();
                this.saveLayout();
            }
            this.editingWidgetId = null;
        } else {
            this.createWidget({ ...template, w: 2, h: 2 });
        }

        this.showShortcutModal = false;
    }

    cancelShortcut() {
        this.editingWidgetId = null;
        this.showShortcutModal = false;
        if (!this.editingWidgetId) {
            this.showAddWidgetSidebar = true;
        }
    }

    createWidget(template: Partial<DashboardWidget>) {
        let maxY = 0;
        if (this.grid) {
            this.grid.engine.nodes.forEach(n => {
                const bottom = (n.y || 0) + (n.h || 0);
                if (bottom > maxY) maxY = bottom;
            });
        }

        // Set default widget sizes based on type if not provided
        let defaultW = template.w || 2;
        let defaultH = template.h || 2;

        if (!template.w || !template.h) {
            switch (template.type) {
                case 'chart':
                    defaultW = 3;
                    defaultH = 2;
                    break;
                case 'list':
                    defaultW = 2;
                    defaultH = 2;
                    break;
                case 'stat':
                    defaultW = 2;
                    defaultH = 2;
                    break;
                case 'shortcut':
                    defaultW = 2;
                    defaultH = 2;
                    break;
                default:
                    defaultW = 2;
                    defaultH = 2;
            }
        }

        const newWidget: DashboardWidget = {
            id: 'w_' + Date.now(),
            dashboard_id: this.currentDashboardId,
            title: template.title || 'New Widget',
            type: template.type as any,
            x: 0,
            y: maxY,
            w: defaultW,
            h: defaultH,
            value: template.value,
            icon: template.icon,
            color: template.color,
            content: template.content,
            meta: template.content ? JSON.parse(template.content) : undefined,
            config: template.config || { // Default config if missing
                title: template.title,
                value: template.value,
                icon: template.icon,
                color: template.color,
                content: template.content ? JSON.parse(template.content) : {}
            }
        };

        this.widgets.push(newWidget);
        this.cdr.detectChanges();

        setTimeout(() => {
            const el = document.getElementById(newWidget.id);
            if (el && this.grid) {
                this.grid.makeWidget(el);
                this.showAddWidgetSidebar = false;
                this.saveLayout();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                console.error('Could not find element to initialize:', newWidget.id);
            }
        }, 150);
    }

    handleWidgetClick(w: DashboardWidget) {
        if (this.isEditMode) return;

        // Priority: Config Action > Legacy Shortcut Meta
        const path = w.config?.action?.payload || (w.type === 'shortcut' ? w.meta?.link : null);

        if (path) {
            this.router.navigate([path]);
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initializeGrid();
        this.loadDashboard(this.currentDashboardId);
    }

    ngOnDestroy() {
        if (this.grid) {
            this.grid.destroy(false);
        }
    }

    initializeGrid() {
        const options: GridStackOptions = {
            cellHeight: 100,
            margin: 10,
            column: 12,
            animate: true,
            staticGrid: true,
            disableDrag: true,
            disableResize: true
        };

        this.grid = GridStack.init(options, this.gridStackEl.nativeElement);

        this.grid.on('change', (event, items) => {
            this.saveLayout();
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        if (this.grid) {
            this.grid.setStatic(!this.isEditMode);
            if (this.isEditMode) {
                this.grid.enableMove(true);
                this.grid.enableResize(true);
            } else {
                this.grid.enableMove(false);
                this.grid.enableResize(false);
            }
        }
    }

    editWidget(w: DashboardWidget) {
        this.editingWidgetId = w.id;

        if (w.type === 'shortcut') {
            this.tempShortcutConfig = {
                title: w.title,
                link: w.meta?.link || '',
                label: w.meta?.label || '',
                icon: w.icon || 'link',
                color: w.color || 'bg-blue-500'
            };
            this.showShortcutModal = true;
        } else {
            // Generic handling for Stat, Chart, etc using Template Editor
            this.editingWidgetConfig = w.config ? JSON.parse(JSON.stringify(w.config)) : {};

            // Ensure core props are in config
            this.editingWidgetConfig.title = w.title;
            this.editingWidgetConfig.type = w.type;
            this.editingWidgetConfig.icon = w.icon;
            this.editingWidgetConfig.color = w.color;

            if (w.meta) {
                this.editingWidgetConfig.content = JSON.parse(JSON.stringify(w.meta));
            } else if (w.content) {
                try {
                    this.editingWidgetConfig.content = JSON.parse(w.content);
                } catch (e) {
                    this.editingWidgetConfig.content = w.content;
                }
            }

            this.showEditWidgetSidebar = true;
        }
    }

    saveWidgetConfig(newConfig: any) {
        if (!this.editingWidgetId) return;

        const widgetIndex = this.widgets.findIndex(w => w.id === this.editingWidgetId);
        if (widgetIndex > -1) {
            const w = this.widgets[widgetIndex];

            w.config = newConfig;
            w.title = newConfig.title;
            w.icon = newConfig.icon;
            w.color = newConfig.color;
            w.value = newConfig.value || newConfig.content?.value;

            // Sync Meta & Content
            if (newConfig.content) {
                if (typeof newConfig.content === 'object') {
                    w.meta = newConfig.content;
                    w.content = JSON.stringify(w.meta);
                } else {
                    try {
                        w.meta = JSON.parse(newConfig.content);
                    } catch (e) {
                        w.meta = { label: newConfig.content };
                    }
                    w.content = newConfig.content;
                }
            }

            this.cdr.detectChanges();
            this.saveLayout();
        }

        this.showEditWidgetSidebar = false;
        this.editingWidgetId = null;
    }

    deleteWidget(w: DashboardWidget) {
        if (confirm(`Are you sure you want to delete "${w.title}" ? `)) {
            const el = document.getElementById(w.id);
            if (el && this.grid) {
                this.grid.removeWidget(el);
            }
            this.widgets = this.widgets.filter(widget => widget.id !== w.id);
            this.saveLayout();
        }
    }

    loadDashboard(dashboardId: string) {
        this.isLoading = true;
        this.error = null;
        this.currentDashboardId = dashboardId;

        this.grid.removeAll();

        this.dashboardService.getWidgets(dashboardId).subscribe({
            next: (data) => {
                this.isLoading = false;

                this.widgets = (data || []).map(w => {
                    let meta = {};
                    let config = {};
                    let template = w.template ? { ...w.template } : null;

                    // Parse instance content (UPDATED: added stat)
                    if (w.content && (w.type === 'stat' || w.type === 'list' || w.type === 'bar' || w.type === 'pie' || w.type === 'line' || w.type === 'shortcut' || w.type === 'picture')) {
                        try {
                            meta = JSON.parse(w.content);
                        } catch (e) {
                            console.error('Failed to parse widget content:', w.id, e);
                        }
                    }

                    if (w.config) {
                        try {
                            config = typeof w.config === 'string' ? JSON.parse(w.config) : w.config;
                        } catch (e) {
                            console.error('Failed to parse widget config:', w.id, e);
                        }
                    }

                    if (template && template.defaultConfig) {
                        try {
                            if (typeof template.defaultConfig === 'string') {
                                template.defaultConfig = JSON.parse(template.defaultConfig);
                            }
                            if (template.defaultConfig.content && typeof template.defaultConfig.content === 'string') {
                                try {
                                    template.defaultConfig.content = JSON.parse(template.defaultConfig.content);
                                } catch (e) { }
                            }
                        } catch (e) {
                            console.error('Failed to parse template config:', w.id, e);
                        }
                    }

                    return { ...w, meta, config, template };
                });

                this.cdr.detectChanges();

                setTimeout(() => {
                    this.widgets.forEach(w => {
                        const el = document.getElementById(w.id);
                        if (el) {
                            this.grid.makeWidget(el);
                        }
                    });
                }, 100);

            },
            error: (err) => {
                console.error('Error loading dashboard:', err);
                this.isLoading = false;
                this.error = 'Failed to load dashboard.';
                this.cdr.detectChanges();
            }
        });
    }

    switchDashboard(id: string) {
        if (this.currentDashboardId === id) return;
        this.loadDashboard(id);
    }

    saveLayout() {
        const saveList = this.grid.save(false) as DashboardWidget[];

        const mergedWidgets = saveList.map(item => {
            const original = this.widgets.find(w => w.id === item.id);

            if (!original) {
                return null;
            }

            let content = original.content;
            if (original.meta) {
                try {
                    content = JSON.stringify(original.meta);
                } catch (e) {
                    console.error('Error serializing meta for widget:', original.id);
                }
            }

            return {
                ...original,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                content: content
            } as DashboardWidget;
        }).filter(w => w !== null) as DashboardWidget[];

        this.dashboardService.saveWidgets(this.currentDashboardId, mergedWidgets).subscribe();
    }

    trackByWidgetId(index: number, widget: DashboardWidget): string {
        return widget.id;
    }
}
